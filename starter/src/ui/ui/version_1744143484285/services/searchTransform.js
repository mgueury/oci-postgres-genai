//
// Example code, not for use in production environments.
//
define(['urijs/URI'], function (URI) {
'use strict';

    class Request {
         /**
          * @typedef {Object} Configuration
          * @property {Object} fetchConfiguration configuration for the current fetch call
          * @property {Object} endpointDefinition metadata for the endpoint
          * @property {function} readOnlyParameters: Path and query parameters. These are not writable.
          * @property {Object} initConfig map of other configuration passed into the request. The
          * 'initConfig' exactly matches the 'init' parameter of the request.
          * @property {string} url full url of the request.
          */

        /**
         * @typedef {Object} TransformsContext a transforms context object that can be used by authors of transform
         * functions to store contextual information for the duration of the request.
         */

        /**
         * filter builds filter expression query parameter using either the deprecated
         * filterCriteria array or filterCriterion object set on the options.
         * @param {Configuration} configuration
         * @param {Object} options the JSON payload that defines the filterCriterion
         * @param {TransformsContext} transformscontext a transforms context object that can be used by authors of transform
         * functions to store contextual information for the duration of the request.
         * @returns {Configuration} configuration object, the url looks like ?filter=foo eq bar
         */
        /* filter(configuration, options, transformscontext) {
            
            const filterCriterion = options;

            const jetFilterOpToScim = (fop) => {
                switch (fop) {
                    case '$eq':
                        return 'eq';
                    case '$ne':
                        return 'ne';
                    case '$co':
                        return 'co';
                    default:
                        console.warn('unable to interpret the op ' + fop);
                        return null;
                }
            };

            const isEmpty = val => (val === undefined || val === null || val === '');

            if (typeof filterCriterion === 'object' && Object.keys(filterCriterion).length > 0) {
                if (filterCriterion.op && filterCriterion.attribute && !isEmpty(filterCriterion.value)) {
                  const atomicExpr = {};
                  atomicExpr.op = jetFilterOpToScim(filterCriterion.op);
                  atomicExpr.attribute = filterCriterion.attribute;
                  atomicExpr.value = filterCriterion.value;

                  if (atomicExpr.op && atomicExpr.attribute) {
                    configuration.url = URI(configuration.url).addQuery({
                      filter: atomicExpr.attribute + ' ' + atomicExpr.op + ' ' + atomicExpr.value
                    }).toString();
                  }
                }
            }

            return configuration;
        }*/

        /**
         * @typedef {Object} PaginateOptions
         * @property {number} iterationLimit
         * @property {number} offset which item the response should begin from
         * @property {String} pagingState
         * @property {number} size how many items should be returned
         */

        /**
         * pagination function appends limit and offset parameters to the url
         * @param {Configuration} configuration
         * @param {PaginateOptions} options
         * @param {TransformsContext} transformscontext
         * @returns {Configuration} configuration object.
         */
        paginate(configuration, options, transformscontext) {
            // TODO: Replace example code
            let newUrl = configuration.url;
            // <MGUEURY>
            // newUrl = URI(newUrl).addSearch({limit: options.size, offset: options.offset}).toString();
            newUrl = URI(newUrl).addSearch({size: options.size, from: options.offset}).toString();
            // </MGUEURY>
            configuration.url = newUrl;
            return configuration;
        }

        /**
         * sort the 'uriParameters' property is passed in as options. Normally uriParameters are appended
         * to the URL automatically, but there may be cases where the user would want to adjust the query parameters.
         * @param {Configuration} configuration
         * @param {Array} options
         * @param {TransformsContext} transformscontext
         * @returns {Configuration} configuration object, the url looks like ?orderBy=foo:asc
         */
        /*sort(configuration, options, transformscontext) {
            
            if (Array.isArray(options) && options.length > 0) {
                const firstItem = options[0];
                if (firstItem.attribute) {
                    const dir = firstItem.direction === 'descending' ? 'desc' : 'asc';
                    let newUrl = configuration.url;
                    newUrl = URI(newUrl).addSearch({orderBy: firstItem.attribute + ':' + dir}).toString();
                    configuration.url = newUrl;
                }
            }
            return configuration;
        }*/

        /**
         * query function
         * @param {Configuration} configuration
         * @param {object} options
         * @param {TransformsContext} transformscontext
         * @returns {Configuration} configuration object
         */
        /*query(configuration, options, transformscontext) {
            
            const c = configuration;
            if (options && options.search) {
                let newUrl = c.url;
                newUrl = URI(newUrl).addSearch( options.search, 'faq' ).toString(); // appends 'faq' to the search term
                c.url = newUrl;
            }
            return c;
        }*/

        /**
         * select typically uses the 'responseType' to construct a query parameter to select and expand
         * the fields returned from the service
         * Example:
         *
         * Employee
         * - firstName
         * - lastName
         * - department
         *   - items[]
         *     - departmentName
         *     - location
         *        - items[]
         *          - locationName
         *
         * would result in this 'fields' query parameter:
         *
         * fields=firstName,lastName;department:departmentName;department.location:locationName
         *
         * @param {Configuration} configuration
         * @param {object} options
         * @param {TransformsContext} transformscontext
         */
        /*select(configuration, options, context) {
            
            const queryParamExists = (url, name) => {
                const q = url.indexOf('?');
                if (q >= 0) {
                    return (url.indexOf(`?${name}`) === q) || (url.indexOf(`&${name}`) > q);
                }
                return false;
            };

            // the options should contain a 'type' object, to override
            const c = configuration;

            // do nothing if it's not a GET
            if (c.endpointDefinition && c.endpointDefinition.method !== 'GET') {
                return c;
            }

            // do nothing if there's already a '?fields='
            if(queryParamExists(c.url, 'fields')) {
                return c;
            }

            // if there's an 'items', use its type; otherwise, use the whole type
            const typeToInspect = (options && options.type && (options.type.items || options.type));
            if(typeToInspect && typeToInspect === Object) {
                const fields = 'TODO: query parameters'; // just an example; query parameter construction is left to the developer

                if(fields) {
                  c.url = URI(c.url).addSearch('fields', fields).toString();
                }
            }
            return c;
        }*/

        /**
         * fetchByKeys allows the page author to take a key or Set of keys passed in via the options and
         * tweak the URL, to fetch the data for the requested keys.
         * @param {Configuration} configuration
         * @param {object} options
         * @param {TransformsContext} transformscontext
         */
        /*fetchByKeys(configuration, transformOptions) {
            
            const c = configuration;
            const to = transformOptions || {};
            const fetchByKeys = !!(c && c.capability === 'fetchByKeys'); // this tells us that the current fetch call is a fetchByKeys

            if (fetchByKeys) {
                const keysArr = Array.from(c.fetchParameters.keys);
                const key = keysArr[0]; // grab the key provided by caller
                if (key) {
                    c.url = URI(c.url).addQuery({ id: key }).toString();
                }
            }
            return c;
        }*/

        /**
         * body is used to build or tweak the body for the fetch request. With some endpoints the search is made with a
         * complex search criteria set on the body that can be tweaked here.
         * This transform function is the only function that is guaranteed to be called after all other request
         * transform functions, (filter, sort, paginate, and so on). The reason is that any of the other transform
         * functions can set info into the 'transformsContext' parameter, as a way to update the body.
         * @param {Configuration} configuration
         * @param {object} options
         * @param {TransformsContext} transformscontext
         */
        /*body(configuration, options, transformsContext) {
            
            const c = configuration;
            if (options && Object.keys(options).length > 0) {
                c.initConfig.body = c.initConfig.body || {};
                // update body
            }
            return c;
        }*/
    };

    class Response {
        /**
         * @typedef {Object} PaginateResponse
         * @property {number} totalSize optional what the totalSize of the result is (the total count of the records in
         * the service endpoint).
         * @property {boolean} hasMore usually required, the paginate response transform function is relied upon to
         * inform the ServiceDataProvider when to stop requesting to fetch more data. Indicates whether there are more
         * records to fetch
         * @property {String} pagingState optional. This can be used to store any paging state specific to the paging
         * capability supported by the endpoint. This property can be used in the response paginate transform function
         * to set an additional paging state. This will then be passed as is to the request paginate transform function
         * for the next fetch call.
         */

        /**
         * paginate is called with the response so this function can process it and return an object with
         * properties set.
         * @param {object} result
         * @param {TransformsContext} transformscontext
         * @return {PaginateResponse}
         */
        paginate(result, transformscontext) {
            // TODO: Replace example code
            const tr = {};

            if (result && result.body) {
                const cb = result.body;
                // <MGUEURY>
                cb.totalCount = cb.hits.total.value;
                // </MGUEURY>
                if (cb.totalCount) {
                    tr.totalSize = cb.totalCount;
                }
                if (cb.totalCount >= 0) {
                    tr.hasMore = !!cb.hasMore;
                } else {
                    tr.hasMore = false;
               }
            }
            return tr;
        }

        /**
         * body is called last, after all the other response transforms have been called. It is a hook for authors
         * to transform the response body or build an entirely new one.
         * @param {object} result
         * @param {TransformsContext} transformscontext
         * @return {object}
         */
        /*body(result) {
            
            let tr = {};
            if (result.body) {
                tr = result.body;
            }

            // as a example store some random aggregation data
            tr.aggregation = { example: 4 };

            return tr;
        }*/
    }

    return {
        request: Request,
        response: Response
   };
});