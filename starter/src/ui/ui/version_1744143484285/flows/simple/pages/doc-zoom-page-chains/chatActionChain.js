define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  const REST_SERVER = ""

  function chatScrolltoEnd() {
    var chatScroll = document.getElementById("chat-scroll");
    chatScroll.scrollTop = chatScroll.scrollHeight;
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

  class chatActionChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application } = context;
        if( $page.variables.message==="" ) {
          return;
        }
 
        let json_body = {
          "documentPath": $page.variables.documentPath,
          "chatHistory" : $page.variables.chatHistory,
          "message": $page.variables.message
        };
 
         let userChat = {
          role: "USER",
          message: $page.variables.message
        };
        $page.variables.chatHistory.push( userChat );
        $page.variables.message = "";
    
        chatScrolltoEnd();       
        const myTimeout = setTimeout(chatScrolltoEnd, 500);
        let llmRestResult = await callPOST( REST_SERVER + "/app/cohere_chat", json_body );
        /*
        let llmRestResult = await Actions.callRest(context, {
          endpoint: 'generate/postGenerate',
          body: this.getLlmRequest(prompt),
        });
        */
        try {
          let j = JSON.parse(llmRestResult);
          if (j.text) {
            let assistantChat = {
              role: "CHATBOT",
              message: j.text
            };
            $page.variables.chatHistory.push( assistantChat );
            chatScrolltoEnd();
            const myTimeout = setTimeout(chatScrolltoEnd, 500);

            // highlightCitations(j.citations);
            //  this.highlightCommonSubString(j.text, $page.variables.queryResponse);
          } 
        } catch(error) {
          // GenAI does not answer with JSON sometimes....
          $page.variables.error = llmRestResult;
        }

    }
  }

  return chatActionChain;
});



