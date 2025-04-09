define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils00
) => {
  'use strict';

  const REST_SERVER = ""

  function highlightText(searchValue) {
    if (searchValue !== '') {
      let aElem = document.getElementsByClassName("opensearch-content");
      for (let i = 0; i < aElem.length; i++) { 
        let content = aElem[i].innerHTML;
        content = content.replaceAll("\n"," ");
        const highlightedContent = content.replace(
          new RegExp(searchValue, 'gi'),
          '<span class="highlight">$&</span>'
        );
        aElem[i].innerHTML = highlightedContent;
      }
    }
  }

  function highlightCitations(citations) {
    if (citations.length>0) {
      let aElem = document.getElementsByClassName("opensearch-content");
      for (let i = 0; i < aElem.length; i++) {
        let content = aElem[i].innerHTML;
        content = content.replaceAll("\n", " ");
        for( let cit of citations ) {
          content = content.replace(
            new RegExp(cit.text, 'gi'),
            '<span class="highlight">$&</span>'
          );
        }
        aElem[i].innerHTML = content;
      }
    }
  }


  function callPOST(url,json_body) {
      return new Promise(function (resolve, reject) {
          let xhr = new XMLHttpRequest();
          xhr.open("POST", url, true);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.onload = function () {
              if (this.status >= 200 && this.status < 300) {
                  resolve(xhr.response);
              } else {
                  reject({
                      status: this.status,
                      statusText: xhr.statusText
                  });
              }
          };
          xhr.onerror = function () {
              reject({
                  status: this.status,
                  statusText: xhr.statusText
              });
          };
          let body = JSON.stringify(json_body)
          xhr.send(body);
      });
  }


  class searchActionJS extends ActionChain {

    longestCommonSubstring(str1, str2) {
      let n = str1.length;
      let m = str2.length;

      let lcs = [];
      for (let i = 0; i <= n; i++) {
        lcs[i] = [];
        for (let j = 0; j <= m; j++) {
          lcs[i][j] = 0;
        }
      }
      let result = "";
      let max = 0;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
          if (str1[i] === str2[j]) {
            lcs[i + 1][j + 1] = lcs[i][j] + 1;
            if (lcs[i + 1][j + 1] > max) {
              max = lcs[i + 1][j + 1];
              result = str1.substring(i - max + 1, i + 1);
            }
          }
        }
      }
      return result;
    }


    highlightCommonSubString(response, hits) {
      hits.forEach((hit, index, array) => {
        console.log("highlightCommonSubString: " + hit.content);
        let common = this.longestCommonSubstring(response, hit.content);
        if (common.length > 20) {
          highlightText(common);
        }
      });
    }

    getLlmRequest(prompt) {
      prompt.replaceAll("\"", "'");

      let llmRequest = {
        "message": prompt
      };
      return llmRequest;
    }

    getLlmRequestForQuestion(question) {
      let prompt = 'You are a program answering with a simple clear response of one sentence.\n'
        + 'Question: ' + question;
      return this.getLlmRequest(prompt);
    }

    /**
     * searchActionJS
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.originButton 
     */
    async run(context, { originButton = 'search' }) {
      const { $page, $flow, $application } = context;

      $page.variables.originButton = originButton;
      $page.variables.ragResponse = "...";
      $page.variables.ragDocument = "";

      if (originButton === "generate") {
        $page.variables.searchHit = [];
        let llmRestResult = await callPOST( REST_SERVER + "/app/cohere_chat", this.getLlmRequestForQuestion($page.variables.searchText));
        /*
        let llmRestResult = await Actions.callRest(context, {
          endpoint: 'generate/postGenerate',
          body: this.getLlmRequestForQuestion($page.variables.searchText),
        });
        */
        try {
          let j = JSON.parse(llmRestResult);
          $page.variables.ragResponse = j.text; 
        } catch(error) {
          // GenAI does not answer with JSON sometimes....
          $page.variables.ragResponse = llmRestResult; 
        }
        return;
      } else {
        let query = {
           "type": originButton,
           "question": $page.variables.searchText
        };
        let callRestOpensearchSearchResult = await callPOST( REST_SERVER + "/app/query", query);
        /*
        const callRestOpensearchSearchResult = await Actions.callRest(context, {
          endpoint: 'query/postQuery',
          responseBodyFormat: 'json',
          responseType: 'queryResponseType',
          body: query
        });
        */
        $page.variables.queryResponse = JSON.parse(callRestOpensearchSearchResult);
      }
      $page.variables.hitTotal = $page.variables.queryResponse.length;
      const truncateResult = await $page.functions.TruncateContent($page.variables.queryResponse);
      $page.variables.searchHit = truncateResult;
      // $page.variables.searchHit = $page.variables.queryResponse;

      if( originButton !== "rag" ) {
        setTimeout(function () {
          highlightText($page.variables.searchText);
        }, 200);
      } else {
        let documents = [];
        for (let res of truncateResult) {
           documents.push( {
             "filename": res.filename,
             "snippet": res.content
           });
        }
        let message =
          `You are a helpful agent. The question is: "${$page.variables.searchText}". 
To respond to the question, follow 2 rules:
1. Answer the question only based in the documents
2. If the answer is not found in the content of the documents below, say "I do not find the answer in the documents." 
`;
        let json_body = {
          "documents": documents,
          "chatHistory" : [],
          "message": message
        };
        let llmRestResult = await callPOST( REST_SERVER + "/app/cohere_chat", json_body );
        /*
        let llmRestResult = await Actions.callRest(context, {
          endpoint: 'generate/postGenerate',
          body: this.getLlmRequest(prompt),
        });
        */
        try {
          let j = JSON.parse(llmRestResult);
          $page.variables.ragResponse = j.text;
          let response = "-";
          if (j.text) {
            $page.variables.ragResponse = j.text;
            let documents = new Set();
            for( let doc of j.documents ) {
               documents.add(doc.filename);
            }
            if( documents.size==1 ) {
              $page.variables.ragDocument = "Document: " + Array.from(documents).join(', ');
            } else if( documents.size>1 ) {
              $page.variables.ragDocument = "Documents: " + Array.from(documents).join(', ');;
            }
            highlightCitations(j.citations);
            //  this.highlightCommonSubString(j.text, $page.variables.queryResponse);
          }
          else {
            let llmRestResult2 = await callPOST( REST_SERVER + "/app/generate", this.getLlmRequestForQuestion($page.variables.searchText) );
            $page.variables.ragDocument = "I think that: " + llmRestResult2;
            $page.variables.ragResponse = "I do not find the answer in the documents.";
          }
        } catch(error) {
          // GenAI does not answer with JSON sometimes....
          $page.variables.ragResponse = llmRestResult;
        }

      }
    }
  }
  return searchActionJS;
});
