# Import
import os
import psycopg2
import shared_oci 
from shared_oci import log
from shared_oci import dictString
from shared_oci import dictInt

# Connection
dbConn = None

## -- initDbConn --------------------------------------------------------------

def initDbConn():
    global dbConn 
    dbConn = psycopg2.connect(dbname="postgres", user=os.getenv('DB_USER'), password=os.getenv('DB_PASSWORD'), host=os.getenv('DB_URL'))
    dbConn.autocommit = True

## -- closeDbConn --------------------------------------------------------------

def closeDbConn():
    global dbConn 
    dbConn.close()

# -- createDoc -----------------------------------------------------------------

def createDoc(result):  
    content = ""
    for p in result["pages"]:
        # Concatenate the pages
        content = content + p
        # Get Next Chunks
        chuncks = shared_oci.cutInChunks( p )
        for c in chuncks:
            result["cohereEmbed"] = shared_oci.embedText(c)
            insertDocsChunck(result,c)
    insertDocs( result, content )

# -- insertDocs -----------------------------------------------------------------

def insertDocs(result, content):  
    global dbConn
    cur = dbConn.cursor()
    stmt = """
        INSERT INTO docs (
            application_name, author, translation, cohere_embed, content, content_type,
            creation_date, modified, other1, other2, other3, parsed_by,
            filename, path, publisher, region, summary
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """
    data = (
            dictString(result,"applicationName"), 
            dictString(result,"author"),
            dictString(result,"translation"),
            dictString(result,"cohereEmbed"),
            content,
            dictString(result,"contentType"),
            dictString(result,"creationDate"),
            dictString(result,"modified"),
            dictString(result,"other1"),
            dictString(result,"other2"),
            dictString(result,"other3"),
            dictString(result,"parsed_by"),
            dictString(result,"filename"),
            dictString(result,"path"),
            dictString(result,"publisher"),
            os.getenv("TF_VAR_region"),
            dictString(result,"summary")
        )
    try:
        cur.execute(stmt, data)
        # Get generated id
        result["doc_id"] = cur.fetchone()[0]
        log(f"<insertDocs> Successfully inserted {cur.rowcount} records.")
    except (Exception, psycopg2.Error) as error:
        log(f"<insertDocs> Error inserting records: {error}")
    finally:
        # Close the cursor and connection
        if cur:
            cur.close()

# -- insertDocsChunck -----------------------------------------------------------------

def insertDocsChunck(result,c):  
    global dbConn
    cur = dbConn.cursor()
    stmt = """
        INSERT INTO docs_chunck (
            doc_id, translation, cohere_embed, content, content_type,
            filename, path, region, summary, page, start, end
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    data = [
        (dictInt(result,"docId"), 
            dictString(result,"translation"),
            dictString(result,"cohereEmbed"),
            c.text,
            dictString(result,"contentType"),
            dictString(result,"filename"),
            dictString(result,"path"),
            os.getenv("TF_VAR_region"),
            dictString(result,"summary"),
            dictInt(result,"page"),
            c.start,
            c.end,
        )
    ]
    try:
        cur.executemany(stmt, data)
        log(f"<insertDocsChunck> Successfully inserted {cur.rowcount} records.")
    except (Exception, psycopg2.Error) as error:
        log(f"<insertDocsChunck> Error inserting records: {error}")
    finally:
        # Close the cursor and connection
        if cur:
            cur.close()

# -- deleteDoc -----------------------------------------------------------------

def deleteDoc(path):  
    global dbConn
    cur = dbConn.cursor()
    stmt = "delete from docs_chunck where path=%s"
    log(f"<deleteDoc> path={path}")
    try:
        cur.execute(stmt, (path,))
        print(f"<deleteDoc> Successfully {cur.rowcount} deleted")
    except (Exception, psycopg2.Error) as error:
        print(f"<deleteDoc> Error deleting: {error}")
    finally:
        # Close the cursor and connection
        if cur:
            cur.close()


# -- queryDb ----------------------------------------------------------------------

def queryDb( type, question, embed ):
    if type=="search":
        # Text search example
        query = """
        SELECT filename, path, content, content_type, region, page, summary, ts_rank_cd(to_tsvector(content), plainto_tsquery('{0}')) score FROM docs_chunck
        WHERE to_tsvector(content) @@ plainto_tsquery('{0}') order by score DESC LIMIT 10
        """.format(question)
    elif type=="semantic":
        query = """
        SELECT filename, path, content, content_type, region, page, summary, 1 score FROM docs_chunck
        ORDER BY cohere_embed <=> '{0}' LIMIT 10
        """.format(embed)
    elif type in ["hybrid","rag"]:
        query = """
        WITH text_search AS (
            SELECT id, ts_rank_cd(to_tsvector(content), plainto_tsquery('{0}')) AS text_rank
            FROM docs_chunck
            WHERE to_tsvector(content) @@ plainto_tsquery('jazz')
        ),
        vector_search AS (
            SELECT id, cohere_embed <=> '{1}' AS vector_distance
            FROM docs_chunck
        ),
        text_vector AS (
            SELECT COALESCE(ts.id,vs.id) id, (0.3 * COALESCE(ts.text_rank,0) + 0.7 * (1 - COALESCE(vs.vector_distance,1))) AS score FROM text_search ts
            FULL OUTER JOIN vector_search vs ON vs.id = ts.id
        )
        SELECT o.filename, o.path, o.content, o.content_type, o.region, o.page, o.summary, tv.score AS score
        FROM docs_chunck o
        JOIN text_vector tv ON o.id = tv.id
        ORDER BY score DESC
        LIMIT 10;
        """.format(question,embed)
    else:
        log( "Not supported type " + type)
        return []
    result = [] 
    cursor = dbConn.cursor()
    cursor.execute(query)
    deptRows = cursor.fetchall()
    for row in deptRows:
        result.append( {"filename": row[0], "path": row[1], "content": row[2], "contentType": row[3], "region": row[4], "page": row[5], "summary": row[6], "score": row[7]} )  
    for r in result:
        log("filename="+r["filename"])
        log("content: "+r["content"][:150])
    return result


