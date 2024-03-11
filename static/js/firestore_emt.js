$(document).ready(function() {
            $.ajax({
                type : "GET",
                url : "/dashboard_details",
                beforeSend: function(xhr){
                    xhr.setRequestHeader('Authorization', getCookie('token'));
                    xhr.setRequestHeader('request_type', 'js');
                    },
                success : function(result) {
//                    console.log(result)
                    if (result['data'] == undefined){
                        alert(result['message'])
                        window.location.href = '/login';
                    }
                    else
                    {
                        var nav_html = '<nav class="tnav">'+
                                          '<div style="margin-left:20%; font-size: 16px;" class="nav_bar_horizontal">'+
                                            '<li class="nav_element">' + result['data']['support_id'] + '</li>'+
                                            '<li class="nav_element">' + result['data']['display_department'] + '</li>'+
                                            '<li class="nav_element">' + result['data']['agent_name'] + '</li>'+
                                            '<li class="nav_element" style="float: right;"><a id="signup_nav" href="/logout">LOGOUT</a></li>'+
                                            '<li class="nav_element" style="float: right;"><a id="signup_nav" href="/change_password">Change Password</a></li>'+
                                          '</div>'+
                                        '</nav>'+
                                        '<audio style="visibility: hidden;" preload="auto|metadata|none">'+
                                            '<source id="source" src="sound/new_message.mp3" type="audio/mpeg">'+
                                            'Your browser does not support the audio element' +
                                        '</audio>'
                        document.getElementById("navigation_bar_dynamic_rendering").innerHTML = nav_html
                        manage_unassign(result,"first");
                        manage_active_query(result);
                        manage_closed_query(result,"first");
                        inactivityTime();
                        setTimeout(function(){
                             is_page_loaded = true;
                             $("#closed_chat_count").text($("#close_query_msg").children().size());
                             $("#un_assign_chat_count").text($("#unassign_msg").children().size());
                             $("#active_chat_count").text($("#active_query_msg").children().size());
                             $("#status").val('0')
                             update_status(0, $("#active_query_msg").children().size())
                        }, 5000);

                        //added by sarfaraz
                        setInterval(function(){
                        manage_active_chat_autoclose(result);
                        }, 3*60*1000 );

                        $("#next-close").click(function(){
                           $("#close_query_msg").empty();
                           $("#closed_chat_count").text(0);
                            manage_closed_query(result,"next");
                         });

                        $("#prev-close").click(function(){
                            $("#close_query_msg").empty();
                            $("#closed_chat_count").text(0);
                            manage_closed_query(result,"prev");
                         });

                         $("#next-unassign").click(function(){
                            $("#unassign_msg").empty();
                            $("#un_assign_chat_count").text(0);
                            manage_unassign(result,"next");
                         });

                        $("#prev-unassign").click(function(){
                            $("#unassign_msg").empty();
                            $("#un_assign_chat_count").text(0);
                            manage_unassign(result,"prev");

                         });

                         $("#un_assign_chat_tcount").click(function(){
                         db.collection(result['data']['un_assign_chat']).get().then((queryresult) => {
                                  Swal.fire(queryresult.docs.length.toString());

                            });
                         });



                        //end by sarfaraz
                    }
                },
                error : function(result) {
                 //handle the error\
                 alert("some error occur please try later")
                 window.location.href = '/login';
//                 console.log(result);
                }
            });

        });


        // to handle close browser event
        window.onbeforeunload = function (event) {
            var message = 'Important: Please click on \'Save\' button to leave this page.';
            console.log(event)
//            update_status(0, $("#active_query_msg").children().size())
            if (typeof event == 'undefined') {
                event = window.event;
            }
            if (event) {
                console.log(event)
                $("#status").val('0')
                update_status(0, $("#active_query_msg").children().size())
                event.returnValue = message;
            }
//            return event
            return message;
        };

        $(function () {
            $("a").not('#lnkLogOut').click(function () {
                console.log("inside inklogout")
                window.onbeforeunload = null;
            });
            $(".btn").click(function () {
                console.log("click button")
                window.onbeforeunload = null;
            });
        });


        // to handle user in activity
        var inactivityTime = function () {
            var time;
            window.onload = resetTimer;
            // DOM Events
            document.onmousemove = resetTimer;
            document.onkeypress = resetTimer;
            document.onmousedown = resetTimer; // touchscreen presses
            document.ontouchstart = resetTimer;
            document.onclick = resetTimer;  // touchpad clicks

            function logout_in_active() {
                $("#status").val('0')
                update_status(0, $("#active_query_msg").children().size())
//                alert("You are now logged out.")
                //location.href = 'logout.html'
            }

            function resetTimer() {
                clearTimeout(time);
                // when user inactive for 5 min it marked as offline
                time = setTimeout(logout_in_active, 300000)
                // 1000 milliseconds = 1 second
            }
        };

        var is_page_loaded = false;
        var pageSize=200;
        // Initialize Firebase
//        firebase.initializeApp({
//              apiKey: "AIzaSyA_p90pHTKGwqNvDHF91Rm2rqeLgErfeog",
//              authDomain: "emt-bot.firebaseapp.com",
//              databaseURL: "https://emt-bot.firebaseio.com",
//              projectId: "emt-bot",
//              storageBucket: "emt-bot.appspot.com",
//              messagingSenderId: "395962900929",
//              appId: "1:395962900929:web:352ab8e4c6805f87ec8f40",
//              measurementId: "G-L7HN5W2Z9E"
//        });
         firebase.initializeApp({
                 apiKey: "AIzaSyBBGKf1Q1Xf2YYWCkkIwqTpopDw-LpdA50",
                  authDomain: "tsiitchatbot.firebaseapp.com",
                  databaseURL: "https://tsiitchatbot-default-rtdb.firebaseio.com",
                  projectId: "tsiitchatbot",
                  storageBucket: "tsiitchatbot.appspot.com",
                  messagingSenderId: "664292274624",
                  appId: "1:664292274624:web:ef744ec1cfe7f165875825"
               });
        var supported_file_extension = ["jpg", "jpeg", "png", "pdf"]
        var db = firebase.firestore();
        var lastVisibleUnAssigDoc={};
        function convertTimestamptoTime(unixTimestamp) {
            // then create a new Date object
            dateObj = new Date(unixTimestamp);
            var cDate = dateObj.getDate();
            var cMonth = dateObj.getMonth()+1;
            var cYear = dateObj.getFullYear();

            var cHour = dateObj.getHours();
            var cMin = dateObj.getMinutes();
            var cSec = dateObj.getSeconds();
            var date_to_return = cDate.toString().padStart(2, "0") + "/"
            +cMonth.toString().padStart(2, "0") + "/" + cYear + " " + cHour.toString().padStart(2, "0")
             + ":" + cMin.toString().padStart(2, "0") + ":" + cSec.toString().padStart(2, "0")
            return date_to_return
//            return dateObj.toGMTString()
//            dateObj.setHours(dateObj.getHours() + 5);
//            dateObj.setMinutes(dateObj.getMinutes() + 30);
//            utcString = dateObj.toUTCString();
//<!--            console.log(utcString);-->
//            time = utcString.slice(-12, -4);
//              return dateObj;
//            return time;
        }

        function findValueInArray(value){
          var result = "Doesn't exist";

          for(var i=0; i<supported_file_extension.length; i++){
            var name = supported_file_extension[i];
            if(name == value){
              if (i<3){
                result = "image"
              }
              else{
                result = 'file';
              }

              break;
            }
          }

          return result;
        }

        function transfer_chat(name, support_user_id, support_match_id, department, url, method){
            Swal.fire({
              title: 'Please Enter Support User Id to which you want to transfer chat',
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              width: '500px',
              input: 'text'
            }).then((result) => {
                console.log(result.value);
                if(result.value != undefined && result.value != ""){
                    console.log("hit api")
//                    $('#message-chat-active5e4cfffe348bf25829cb903d').children().size()
//                    var msg_len = $("#message-chat-active"+ support_match_id).children().size()
//                    console.log(msg_len)
                    $.ajax({
                        type : method,
                        url : url,
                        data: {
                            'transfer_support_user_id' : result.value,
                            'executive_name': name,
                            'support_user_id': support_user_id,
                            'support_match_id': support_match_id,
                            'department': department
                            },
                        success : function(result) {
                            if(result['success']==true){
//                                console.log("successFully Moved to Active query ")
                                //window.location.reload();
                                removeActiveChatNodeClose(support_match_id);
                            }
                            else{
                               Swal.fire({
                                 title: "Something Wrong, please try again later",
                                 type: "error"
                             })
                            }
//                            console.log(result);
                        },
                        error : function(result) {
                         //handle the error\
                             Swal.fire({
                             title: "Something Wrong, please try again later",
                             type: "error"
                             })
//                             console.log(result);
                         }

                    });
                }
            })

        }

        function update_status(is_online, chat_count){
            $.ajax({
                type : "POST",
                url : "/update_status",
                beforeSend: function(xhr){
                    xhr.setRequestHeader('Authorization', getCookie('token'));
                    xhr.setRequestHeader('request_type', 'js');
                    xhr.setRequestHeader("Content-Type", "application/json");
                    },
                data: JSON.stringify({
                           'is_online' : is_online,
                           'chat_count': chat_count,
                        }),
                success : function(result) {
                    console.log(result)
//                    if (result['data'] == undefined){
//                        alert(result['message'])
//                        window.location.href = '/login';
//                    }
//                    else
//                    {
//                       }
                },
                error : function(result) {
                 //handle the error\
//                 alert("some error occur please try later")
//                 window.location.href = '/login';
//                 console.log(result);
                }
            });
        }

        async function move_to_close_query(from, support_user_id, support_match_id, department, url, method){
            var optionsData = "";
            var secOptionsData = "";
            var templateData = [];
            var defaultOpt = `<option value="" selected disabled hidden>Choose from here</option>`;

            // Showing Close Chat modal
            $("#closeChatModal").modal('show');

            // Dynamic creation of conversation catgory select options from JSON file.
            await $.getJSON('data/closeQueryTemplate.json', function (data) {
                templateData = data.templates;
                
                // Dynamic Options for category
                templateData.forEach((items) => {
                    optionsData += `<option value="${items.catName}">${items.catName}</option>`;
                })

                // Appending Category options dynamically
                $('#selectNow').append(`${optionsData}`);
            })

            // On change Category, load sub-category dynamically
            $("#selectNow").change(function () {
                // console.log("select now changed")
                $('#confirmCloseChat').prop('disabled', true);

                secOptionsData = defaultOpt;
                var obj = document.getElementById("selectNow");
                var txtCategory = obj.options[obj.selectedIndex].text;

                // Finding selected Category object for sub category loading options
                var subCatArr = templateData.find(category => category.catName === txtCategory)?
                templateData.find(category => category.catName === txtCategory): [];
                
                // creating dynamic sub category options
                subCatArr.subData.forEach((item) => {
                    secOptionsData += `<option value="${item.subCatName}">${item.subCatName}</option>`;
                })

                // Removing and adding new options to the sub category
                $('#selectNow2')
                    .find('option')
                    .remove()
                    .end()
                    .append(`${secOptionsData}`)
                    .prop('disabled', false);
                
            });

            // Enabled yes buttuon when sub category changes
            $("#selectNow2").change(function () {
                // console.log("select now 2 changed")

                if (($(this).val() !== '0')) {
                    $('#confirmCloseChat').prop('disabled', false);
                }
            })

            //  Loading default options when chat closed
            $('#cancelCloseChat,#btnCloseChat').click(function () {
                // console.log("cancelCloseChat btnCloseChat clicked")
                
                $('#selectNow,#selectNow2')
                    .find('option')
                    .remove()
                    .end().append(`${defaultOpt}`);

                $('#confirmCloseChat,#selectNow2').prop('disabled', true);

            })

            // AJAX call when confirm button clicked
            $('#confirmCloseChat').unbind().click(function () {
                // console.log("confirmCloseChat clicked")

                var selectNow = document.getElementById("selectNow");
                var txtCategory = selectNow.options[selectNow.selectedIndex].text;

                var selectNow2 = document.getElementById("selectNow2");
                var txtCategory2 = selectNow2.options[selectNow2.selectedIndex].text;

                $('#selectNow,#selectNow2')
                    .find('option')
                    .remove()
                    .end().append(`${defaultOpt}`);

                $('#confirmCloseChat,#selectNow2').prop('disabled', true);

                console.log("hit api")

                var msg_len = $("#message-chat-active" + support_match_id).children().size()
                var jsonObject = getDataEndChat(support_match_id);
                var currJsonObject = {
                    'from': from,
                    "html_text": $("#message-chat-active" + support_match_id).html(),
                    'total_chat_count': msg_len,
                    'support_user_id': support_user_id,
                    'support_match_id': support_match_id,
                    'department': department,
                    'category': txtCategory,
                    'subCategory': txtCategory2
                };

                var finalJsonData = Object.assign(currJsonObject, jsonObject)
                console.log("finalJsonData***", finalJsonData);
                
                $('#closeChatModal').modal('hide');

                $.ajax({
                    type: method,
                    url: url,
                    data: finalJsonData,
                    success: function (result) {
                        if (result['success'] == true) {
                            removeActiveChatNodeClose(support_match_id);
                        }
                        else {
                            Swal.fire({
                                title: "Something Wrong, please try again later",
                                type: "error"
                            })
                        }
                    },
                    error: function (result) {
                        //handle the error\
                        Swal.fire({
                            title: "Something Wrong, please try again later",
                            type: "error"
                        })
                    }

                });

            })

        }

//         function move_to_close_query(from, support_user_id, support_match_id, department, url, method){
//             Swal.fire({
//               title: 'Do you really want to end this query?',
//               type: 'warning',
//               showCancelButton: true,
//               confirmButtonColor: '#3085d6',
//               cancelButtonColor: '#d33',
//               confirmButtonText: 'Yes',
//               cancelButtonText: 'No',
//               width: '500px'
//             }).then((result) => {
//                 if(result.value){
// //                    console.log("hit api")
// //                    $('#message-chat-active5e4cfffe348bf25829cb903d').children().size()
//                    var msg_len = $("#message-chat-active"+ support_match_id).children().size()
// //                    console.log('<link href="https://emt-attachments.s3.ap-south-1.amazonaws.com/email-css/email.css" rel="stylesheet">' + $("#message-chat-active"+ support_match_id).html())
//                     var jsonObject=getDataEndChat(support_match_id);
//                     var currJsonObject={
//                             'from' : from,
//                             "html_text": $("#message-chat-active"+ support_match_id).html(),
//                             'total_chat_count' : msg_len,
//                             'support_user_id': support_user_id,
//                             'support_match_id': support_match_id,
//                             'department': department
//                             };

//                     var finalJsonData=Object.assign(currJsonObject,jsonObject)

//                     $.ajax({
//                         type : method,
//                         url : url,
//                         data: finalJsonData,
//                         success : function(result) {
//                             if(result['success']==true){
// //                                console.log("successFully Moved to Active query ")
//                                 //window.location.reload();
//                                 removeActiveChatNodeClose(support_match_id);
//                             }
//                             else{
//                                Swal.fire({
//                                  title: "Something Wrong, please try again later",
//                                  type: "error"
//                              })
//                             }
// //                            console.log(result);
//                         },
//                         error : function(result) {
//                          //handle the error\
//                              Swal.fire({
//                              title: "Something Wrong, please try again later",
//                              type: "error"
//                              })
// //                             console.log(result);
//                          }

//                     });
//                 }
//             })

//         }

        function move_to_active_query(support_id, user_support_id, department, url, method, agent_name){

//            var val = confirm("Do you really want to Assign this chat to yourself?");
//            console.log(val);
            Swal.fire({
              title: "Do you really want to Assign this chat to yourself?",
              text: "Are You Sure?",
              type: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              width: '500px'
            }).then((result) => {
                if(result.value){
//                    console.log("hit api to close node")
                    $.ajax({
                        type : method,
                        url : url,
                        data: {
                            "support_match_id": user_support_id,
                            "support_user_id":support_id,
                            "department": department,
                            "executive_name": agent_name,
                        },
                        success : function(result) {
                            if(result['success']==true){
//                                console.log("successFully Moved to Active query ")
                                //window.location.reload();
                                removeUnAssignChatNodeAssign(user_support_id);
                            }
                            else{
                               Swal.fire({
                                 title: "Something Wrong, please try again later",
                                 type: "error"
                             })
                            }
//                            console.log(result);
                        },
                        error : function(result) {
                         //handle the error\
                             Swal.fire({
                             title: "Something Wrong, please try again later",
                             type: "error"
                             })
//                             console.log(result);
                         }

                    });
                }
            })

        }

        function send_msg_user(from, support_user_id, support_match_id, department, url, method){
            var elem = "sent-message-text-"+ support_match_id;
//            console.log(elem);
//            console.log($("#"+elem).val());
            var msg = document.getElementById(elem).value;
//            console.log(msg);
            document.getElementById(elem).value = ""
//            console.log(msg);
            if(msg != ""){
                var settings = {
                  "url": url,
                  "method": method,
                  "timeout": 0,
                  "headers": {
                    "Content-Type": "application/json"
                  },
                  "data": JSON.stringify({
                           'from' : from,
                           'support_user_id': support_user_id,
                           'support_match_id': support_match_id,
                           'department': department,
                           'message' : {
                               'type': 'text',
                               'content': msg,
                            }
                        }),
                   error : function(result) {
                         //handle the error\
                             Swal.fire({
                             title: "Something Wrong, please try again later",
                             type: "error"
                             })
                         }
                };

                $.ajax(settings).done(function (response) {

                  console.log(response);
                  if(response['success']==true){
                        console.log("message sent successfully")
                  }
                  else{
                        Swal.fire({
                             title: "Something went Wrong, please try again later",
                             type: "error"
                         })
                  }
                })
            }
            else{
                Swal.fire({
                     title: "Message Can't be empty!!",
                     type: "error"
                 })
            }

        }

        function handle_file_upload(id, from, support_user_id, support_match_id, department, url, method){
            $("#"+id).on('change',function() {
                fileInput = document.getElementById(id).files[0]
//                 as we need only one file transfer
                if (fileInput != undefined){
//                    var loader = '<img id="loading" src="img/loader.gif" alt="Loading indicator" style="margin-top: 200px; margin-left: 250px;">'
//                    console.log($.parseHTML(loader)[0]);
//                    document.getElementById("tab-content-msg").append($.parseHTML(loader)[0]);
//                    console.log(document.getElementById("tab-content-msg"));
//                    console.log("yeah we found a file ")
//                    console.log(fileInput)
                    var formData = new FormData();
                    var file_extension = fileInput.name.split(".")[fileInput.name.split(".").length - 1].toLowerCase();
                    console.log(file_extension);
                    file_type = findValueInArray(file_extension)
                    if ( file_type == "Doesn't exist"){
                        Swal.fire({
                             title: "File is not supported, Supported file Extension are jpg, jpeg, png, pdf, doc, docx",
                             type: "error"
                             })
                         return
                    }
                    formData.append('from', from);
                    formData.append('support_user_id', support_user_id);
                    formData.append('support_match_id', support_match_id);
                    formData.append('department', department);
                    formData.append('file_type', file_type);
                    formData.append('caption_message', fileInput.name.split(".")[0]);
                    formData.append("file", fileInput, fileInput.name);

                    $.ajax({
                       url: url,
                       type: method,
                       data: formData,
                       cache: false,
                       contentType: false,
                       processData: false,
                       success : function(result) {
                            console.log(result)
                            if(result['success']==true){
//                                console.log("successFully Moved to Active query ")
//                                window.location.reload();
                                  Swal.fire({
                                     title: "File upload Successfully",
                                     type: "success"
                                 })

                            }
                            else{
                               Swal.fire({
                                 title: "Something Wrong, please try again later",
                                 type: "error"
                             })
                            }
//                            console.log(result);
                        },
                        error : function(result) {
                        console.log(result)
                         //handle the error\
                             Swal.fire({
                             title: "Something Wrong, please try again later",
                             type: "error"
                             })
//                             console.log(result);
                         }
                    }, 'json');
//                    $('#loading').remove();
                }
//                console.log(this);
            });
        }
        function render_un_assign_chat_content(support_match_id, name, result){
            var complete_endpoint = result['data']['chat_endpoint'] + support_match_id;
            if (document.getElementById("marked-message-"+support_match_id) == null){
                    var content_html = '<div class="tab-pane message-body" id="marked-message-' + support_match_id + '">'+
                    '<div class="message-top">'+
                        '<strong>Name: ' + name +
                        '<br>TAB:  UN ASSIGN CHAT      <br>CHAT ID: '+ support_match_id+ '</strong>' +
                        '<div class="new-message-wrapper">'+
                            '<div class="form-group">'+
                                '<input type="text" class="form-control" placeholder="Send message to...">'+
                                '<a class="btn btn-danger close-new-message" href="#"><i class="fa fa-times"></i></a>'+
                            '</div>'+
                            '<div class="chat-footer new-message-textarea">'+
                                '<textarea class="send-message-text"></textarea>'+
                                '<label class="upload-file">'+
                                    '<input type="file" required="">'+
                                    '<i class="fa fa-paperclip"></i>'+
                                '</label>'+
                                '<button type="button" class="send-message-button btn-info"><i class="fa fa-send"></i></button>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+

                    '<div class="message-chat">'+
                        '<div class="chat-body" id="message-chat-' +support_match_id  +'">'+
                        '</div>'+
                        '<div class="chat-footer">'+
                        '<button type="button" style="background: #03bd60; height:35px; position: absolute; bottom: 10px; right: 10px;" onclick=\'move_to_active_query("' +
                        result["data"]["support_id"] + '","' + support_match_id + '","' + result["data"]["department"]+ '","' + result["data"]["accept_chat_url"]['url'] +
                        '","' + result["data"]["accept_chat_url"]['method'] + '","' + result['data']['agent_name'] +'")\'><strong>Accept Chat And Help Customer</strong></button>'+
                        '</div>'+
                    '</div>'+
                '</div>';
                document.getElementById('tab-content-msg').append($.parseHTML(content_html)[0]);
             }
//            console.log(complete_endpoint);
             db.collection(complete_endpoint).orderBy("create_time", "asc").onSnapshot(function(querySnapshot) {
//                console.log(querySnapshot);
                var html_to_append = '';
                querySnapshot.docChanges().forEach(function(change) {
                    if (change.type === "added") {
//                        console.log("New city: ", change.doc.data());
                        var number = change.doc.data()['from'];
                        var from = change.doc.data()['sender_id'];
                        var msg = change.doc.data()['body'].split('\n').join('<br />');
                        var time = change.doc.data()['create_time'];
                        var attachment_type = change.doc.data()['attachment_type']
                         var chat_msg = '<div class="message warning" id="message-warning-' + change.doc.id +'">'+
                                        '<img alt="" class="img-circle medium-image" src="https://bootdey.com/img/Content/avatar/avatar1.png">'+
                                        '<div class="message-body">'+
                                            '<div class="message-info">'+
                                                '<h4>' +  name + '</h4>'+
                                                '<h5><i class="fa fa-clock-o"></i>'+ convertTimestamptoTime(time) + '</h5>'+
                                            '</div>'+
                                            '<hr>'+
                                            '<div class="message-text">' + render_msg(msg, attachment_type) +
                                            '</div>'+
                                        '</div>'+
                                        '<br>'+
                                    '</div>'

                        if(document.getElementById("message-chat-"+ support_match_id))
                        document.getElementById("message-chat-"+ support_match_id).append($.parseHTML(chat_msg)[0])
                    }
                    if (change.type === "modified") {
//                        console.log("Modified city: ", change.doc.data());
                    }
                    if (change.type === "removed") {
//                        console.log("Removed city: ", change.doc.data());
                    }
                });

            });

        }

        function manage_unassign(result,action){


        var collQuery= db.collection(result['data']['un_assign_chat']).orderBy("create_time", "desc")
            .limit(pageSize);

        switch(action){
           case "first":
             collQuery= db.collection(result['data']['un_assign_chat']).orderBy("create_time", "desc")
                .limit(pageSize);
             break;
           case "next":
             collQuery= db.collection(result['data']['un_assign_chat']).orderBy("create_time", "desc")
              .startAfter(lastVisibleUnAssign)
               .limit(pageSize);
                break;
             case "prev":
                collQuery= db.collection(result['data']['un_assign_chat']).orderBy("create_time", "desc")
               .endBefore(firstVisibleUnAssign)
                .limitToLast(pageSize);
                break;
        }


            collQuery
            .onSnapshot(function(querySnapshot) {
                    if(querySnapshot.docs.length>0){

                        var pgStr=pageSize-1;
                       $("#unassign_msg>li:gt("+pgStr.toString()+")").remove();
                        firstVisibleUnAssign = querySnapshot.docs[0];
                        lastVisibleUnAssign = querySnapshot.docs[querySnapshot.docs.length - 1];
                    }
                    else{
                        if(action=="next")
                        Swal.fire('There is no next data available');
                        if(action=="prev")
                        Swal.fire('There is no previous data available');
                    }

              querySnapshot.docChanges().forEach(function(change) {
                    if (change.type === "added") {
//                        console.log("New city: ", change.doc.data());
//                        console.log(change.doc.data())
                        var name = change.doc.data()['name'];
                        var msg = change.doc.data()['msg'];
                        var time = change.doc.data()['create_time'];
                        var user_support_id = change.doc.data()['support_match_id'];
                        var number = change.doc.data()['from'];
                        var html = '<li data-toggle="tab" data-target="#marked-message-' + user_support_id + '" id="un-assign-'+ user_support_id + '">' +
                                    '<div class="message-count"> 1</div>' +
                                    '<img alt="" class="img-circle medium-image" src="https://bootdey.com/img/Content/avatar/avatar1.png">' +
                                    '<div class="vcentered info-combo">' +
                                        '<h3 class="no-margin-bottom name"><strong>' +  name + ' | ' + number +  '</strong></h3>' +
//                                        '<h5>' + msg + '</h5>' +
                                    '</div>' +
                                    '<div class="contacts-add">' +
                                        '<span class="message-time">' + convertTimestamptoTime(time) +'</span>' +

                                    '</div>'+
                                '</li>';
                         document.getElementById('unassign_msg').append($.parseHTML(html)[0])
                         render_un_assign_chat_content(user_support_id, name, result);
                        if (is_page_loaded){
                               $("#un_assign_chat_count").text($("#unassign_msg").children().size());
//                             $('audio').get(0).play();
//                             notifyMe("New Un Assign Query");
                        }
                         $("#un-assign-"+ user_support_id).click(function(e){
                         var test = $("#marked-message-"+user_support_id).find("div.chat-body").find("div").last()[0];
                         if(test!= null)
                         {
                            $("#marked-message-"+user_support_id).find("div.chat-body").find("div").last()[0].scrollIntoView();
                            }
                          });
                    }
                    if (change.type === "modified") {
//                        console.log("Modified city: ", change.doc.data());
                    }
                    if (change.type === "removed") {
//                        console.log("Removed city: ", change.doc.data());
                        var user_support_id = change.doc.data()['support_match_id'];
                        var element = document.getElementById('un-assign-' + user_support_id);
                        if(element)
                        element.parentNode.removeChild(element);
                        $("#un_assign_chat_count").text($("#unassign_msg").children().size());
//                        console.log("removed");
                    //added by sarfaraz
                   var messViewElement=document.getElementById("marked-message-"+user_support_id);
                   if(messViewElement)
                    messViewElement.parentNode.removeChild(messViewElement);
                    //end by sarfaraz

                    }
                });

            });

        }

        function send_text_on_enter(support_match_id){
            input_id = "sent-message-text-" + support_match_id
            button_id = "sent-message-button-" + support_match_id
//            console.log(input_id, button_id);

             $('#'+ input_id).keypress(function(e){
              if(e.which == 13){
                   // submit via ajax or
//                   console.log(this.id.split("-")[3])
                   $('#sent-message-button-'+ this.id.split("-")[3]).click();
               }
    });
        }

        function show_image_new_tab()
        {
            console.log("inside me")
            var newTab = window.open();
            var img = localStorage.getItem("img");
            newTab.document.body.innerHTML = '<img src="' + img +'">';
        }

        function render_msg(msg, attachment_type){
            var src = "";
            console.log(attachment_type, msg);
            if (attachment_type == 7){
                if (msg.includes("https://api.infobip.com/")){
                    let url = new URL(msg);
                    let params = new URLSearchParams(url.search);
                    let auth_token = "Basic " + params.get("authorization");
                    var img ;
                    var api_url = msg.split("?")[0];
                    fetch("https://cors-anywhere.herokuapp.com/"+api_url, {
                      method: 'GET',
        //                  mode: "no-cors",
                      headers: {
                        'Authorization': "Basic RU1UV0E6UmlrYW50QDEyMw==",
                        "Content-Type": "image/jpeg"
                      },
                    })
                    .then(response => response.blob())
                    .then(imgResponse => {
                        console.log(imgResponse)

                        const reader = new FileReader();
                        reader.readAsDataURL(imgResponse);
                        reader.onloadend = function() {
                           src = reader.result;
                           console.log(src);
                           localStorage.setItem("img", src);
                        }
                    })
                    src = localStorage.getItem("img")
                    console.log(src)
                  img = '<a href="#"  onclick="show_image_new_tab();"><img src="'+ src + '" style="width:300px; height:300px"></a>'
                  console.log(img)
                  return img
                }

                else {
                    return '<a href="'+ msg +'"target="_blank"><img src="' + msg+'" style="width:300px; height:300px"></a>'
                }

            }
            else if (attachment_type == 10){
                return '<a href="'+ msg + '" target="_blank"><img src="https://emt-attachments.s3.ap-south-1.amazonaws.com/email-css/File-Header.jpg" width="300px" height="150px"/></a>'
            }

            else if (attachment_type == 11){
                return '<a href="'+ msg +'"target="_blank">' + msg + '</a>'
            }
            else
            {
                return msg
            }
        }

        function render_active_chat_content(support_match_id, name, result, from){
            var complete_endpoint = result['data']['chat_endpoint'] + support_match_id;
            if (document.getElementById("inbox-message-"+support_match_id) == null){
                    var content_html = '<div class="tab-pane message-body" id="inbox-message-' + support_match_id + '">'+
                    '<div class="message-top">'+
                        '<strong>Name: ' + name +
                        '<br>TAB:  ACTIVE CHAT      <br>CHAT ID: '+ support_match_id+ '</strong>' +
                         '<button type="button" style="background: #ef0b47; height:35px; position: absolute; bottom: 10px; right: 10px;" onclick=\'move_to_close_query("' + from + '","' +
                        result["data"]["support_id"] + '","' + support_match_id + '","' + result["data"]["department"]+ '","' + result["data"]["end_chat_url"]['url'] +
                        '","' + result["data"]["end_chat_url"]['method'] +'")\'><strong>END CHAT</strong></button>'+
                        

                    '</div>'+

                    '<div class="message-chat">'+
                        '<div class="chat-body" id="message-chat-active' +support_match_id  +'">'+

                        '</div>'+
                        '<div class="chat-footer">'+
                            '<textarea class="send-message-text" id="sent-message-text-' + support_match_id+ '"></textarea>'+
                            '<label class="upload-file">'+
                                '<input type="file" required="" id="file_upload_'+ support_match_id +'">'+
                                '<i class="fa fa-paperclip"></i>'+
                            '</label>'+
                            '<button type="button" class="send-message-button btn-info" id="sent-message-button-' + support_match_id + '" onclick=\'send_msg_user("' + from + '","' +
                        result["data"]["support_id"] + '","' + support_match_id + '","' + result["data"]["department"]+ '","' + result["data"]["send_msg_url"]['url'] +
                        '","' + result["data"]["send_msg_url"]['method'] +'")\'><i class="fa fa-send"></i></button>'+
                        '</div>'+
                    '</div>'+
                '</div>';
                document.getElementById('tab-content-msg').append($.parseHTML(content_html)[0]);
                send_text_on_enter(support_match_id);
                handle_file_upload("file_upload_" + support_match_id, from, result["data"]['support_id'], support_match_id,
                                   result["data"]["department"], result["data"]["send_file_url"]['url'], result["data"]["send_file_url"]['method']);
             }
//            from, support_user_id, support_match_id, department, msg, url, method
//            console.log(complete_endpoint);
             db.collection(complete_endpoint).orderBy("create_time", "asc").onSnapshot(function(querySnapshot) {
//                console.log(querySnapshot);
//                    var html_to_append = '';
                    querySnapshot.docChanges().forEach(function(change) {
                        if (change.type === "added") {
//                            console.log("New city: ", change.doc.data());
//                            console.log(change.doc.data())
                            var number = change.doc.data()['from'];
                            var from = change.doc.data()['sender_id'];
                            var msg = change.doc.data()['body'].split('\n').join('<br />');
                            var time = change.doc.data()['create_time'];
                            var msg_customer_side = change.doc.data()['from_emt']
                            var attachment_type = change.doc.data()['attachment_type']
                            var chat_msg = ''
//                                 if (document.getElementById("message-warning-"+doc.id) == null){
                             if (msg_customer_side == true){
                                 if (is_page_loaded){
                                     $('audio').get(0).play();
                                     notifyMe(msg);
                                }


                                chat_msg = '<div class="message info" id="message-active-' + change.doc.id +'">'+
                                            '<img alt="" class="img-circle medium-image" src="https://bootdey.com/img/Content/avatar/avatar1.png">'+
                                            '<div class="message-body">'+
                                                '<div class="message-info">'+
                                                    '<h4>' +  name + '</h4>'+
                                                    '<h5><i class="fa fa-clock-o"></i>'+ convertTimestamptoTime(time) + '</h5>'+
                                                '</div>'+
                                                '<div class="message-text">' + render_msg(msg, attachment_type) +
                                                '</div>'+
                                                '<hr>'+
                                            '</div>'+
                                            '<br>'+
                                        '</div>'
                             }
                             else{
                                chat_msg = '<div class="message my-message" id="message-active-' + change.doc.id +'">'+
                                            '<img alt="" class="img-circle medium-image" src="https://bootdey.com/img/Content/avatar/avatar1.png">'+
                                            '<div class="message-body">'+
                                                '<div class="message-info">'+
                                                    '<h4>' +  result['data']['agent_name'] + '</h4>'+
                                                    '<h5><i class="fa fa-clock-o"></i>'+ convertTimestamptoTime(time) + '</h5>'+
                                                '</div>'+
                                                '<div class="message-text">' + render_msg(msg, attachment_type) +
                                                '</div>'+
                                                '<hr>'+
                                            '</div>'+
                                            '<br>'+
                                        '</div>'
                             }

//                             html_to_append += chat_msg
                            if(document.getElementById("message-chat-active"+ support_match_id))
                             document.getElementById("message-chat-active"+ support_match_id).append($.parseHTML(chat_msg)[0])
//                                }
//                                else:
//                                console.log(doc.id);

                        //added by sarfaraz
                        UpdateNewMessageCountColor(support_match_id);
                        var latest_newmsg=document.getElementById("message-active-" +change.doc.id);
                        AutoScrollToElem(latest_newmsg);
                        //end by sarfaraz


                        }
                        if (change.type === "modified") {
//                            console.log("Modified city: ", change.doc.data());
                            // as we don't need this
                        }
                        if (change.type === "removed") {
//                            console.log("Removed city: ", change.doc.data());
                            // as we don't need this
                        }
                    });
//                 document.getElementById("message-chat-active"+ support_match_id).innerHTML = html_to_append
            });
        }

        function manage_active_query(result){
            db.collection(result['data']['active_query']).orderBy("create_time", "desc")
            .onSnapshot(function(querySnapshot) {
            querySnapshot.docChanges().forEach(function(change) {
                if (change.type === "added") {
//                    console.log("New city: ", change.doc.data());
                    var name = change.doc.data()['name'];
                    var msg = change.doc.data()['msg'];
                    var time = change.doc.data()['create_time'];
                    var user_support_id = change.doc.data()['support_match_id'];
                    var number = change.doc.data()['from'];
                    var html = '<li data-toggle="tab" data-target="#inbox-message-' + user_support_id  + '" id="active-assign-'+ user_support_id + '\">' +
                                '<div class="message-count">0</div>' +
                                '<img alt="" class="img-circle medium-image" src="https://bootdey.com/img/Content/avatar/avatar1.png">' +
                                '<div class="vcentered info-combo">' +
                                    '<h3 class="no-margin-bottom name"><strong>' +  name + ' | ' + number +  '</strong></h3>' +
//                                            '<h5>' + msg + '</h5>' +
                                '</div>' +
                                '<div class="contacts-add">' +
                                    '<span class="message-time">' + convertTimestamptoTime(time) +'</span>' +

                                '</div>'+
                            '</li>';
                    document.getElementById('active_query_msg').prepend($.parseHTML(html)[0]);
                    render_active_chat_content(user_support_id, name, result, number);
                   if (is_page_loaded){
//                         $('audio').get(0).play();
//                         notifyMe("New Active User");
                         $("#active_chat_count").text($("#active_query_msg").children().size());
                         update_status(parseInt($("#status").val()), $("#active_query_msg").children().size())
                    }
                      //added by sarfaraz
                    ResetMessageCount(user_support_id);
                    $("#active-assign-"+ user_support_id).click(function(e){
                        ResetMessageCount(user_support_id);
                        UpdateNewMessageCountColor(user_support_id);
                        $("#inbox-message-"+user_support_id).find("div.chat-body").find("div").last()[0].scrollIntoView();

                    });
                    //end by sarfaraz

                }
                if (change.type === "modified") {
//                    console.log("Modified city: ", change.doc.data());
                }
                if (change.type === "removed") {
//                    console.log("Removed city: ", change.doc.data());
                    var user_support_id = change.doc.data()['support_match_id'];
                    var element = document.getElementById("active-assign-" + user_support_id);
                    if(element)
                    element.parentNode.removeChild(element);
                    $("#active_chat_count").text($("#active_query_msg").children().size());
                    update_status(parseInt($("#status").val()), $("#active_query_msg").children().size())


                    //added by sarfaraz
                   var messViewElement=document.getElementById("inbox-message-"+user_support_id);
                   if(messViewElement)
                    messViewElement.parentNode.removeChild(messViewElement);
                    //end by sarfaraz

                }
            });
            });

        }

        function render_close_chat_content(support_match_id, name, result){
            var complete_endpoint = result['data']['chat_endpoint'] + support_match_id;
            if (document.getElementById("sent-message-" + support_match_id) == null){
                    var content_html = '<div class="tab-pane message-body" id="sent-message-' + support_match_id + '">'+
                    '<div class="message-top">'+
                    '<strong>Name: ' + name +
                        '<br>TAB:  CLOSE CHAT      <br>CHAT ID: '+ support_match_id+ '</strong>' +
                        '<div class="new-message-wrapper">'+
                            '<div class="form-group">'+
                                '<input type="text" class="form-control" placeholder="Send message to...">'+
                                '<a class="btn btn-danger close-new-message" href="#"><i class="fa fa-times"></i></a>'+
                            '</div>'+
                            '<div class="chat-footer new-message-textarea">'+
                                '<textarea class="send-message-text"></textarea>'+
                                '<label class="upload-file">'+
                                    '<input type="file" required="">'+
                                    '<i class="fa fa-paperclip"></i>'+
                                '</label>'+
                                '<button type="button" class="send-message-button btn-info"><i class="fa fa-send"></i></button>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+

                    '<div class="message-chat">'+
                        '<div class="chat-body" id="message-chat-close' +support_match_id  +'">'+

                        '</div>'+

                    '</div>'+
                '</div>';
                document.getElementById('tab-content-msg').append($.parseHTML(content_html)[0]);
             }

//            console.log(complete_endpoint);
             db.collection(complete_endpoint).orderBy("create_time", "asc").onSnapshot(function(querySnapshot) {
//                console.log(querySnapshot);
//                    var html_to_append = '';
                    querySnapshot.docChanges().forEach(function(change) {
                        if (change.type === "added") {
//                            console.log("New city: ", change.doc.data());
//                            console.log(change.doc.data())
                            var number = change.doc.data()['from'];
                            var from = change.doc.data()['sender_id'];
                            var msg = change.doc.data()['body'].split('\n').join('<br />');
                            var time = change.doc.data()['create_time'];
                            var msg_customer_side = change.doc.data()['from_emt']
                            var attachment_type = change.doc.data()['attachment_type']

                            var chat_msg = ''
//                                 if (document.getElementById("message-warning-"+doc.id) == null){
                             if (msg_customer_side == true){
                                chat_msg = '<div class="message info" id="message-close-' + change.doc.id +'">'+
                                            '<img alt="" class="img-circle medium-image" src="https://bootdey.com/img/Content/avatar/avatar1.png">'+
                                            '<div class="message-body">'+
                                                '<div class="message-info">'+
                                                    '<h4>' +  name + '</h4>'+
                                                    '<h5><i class="fa fa-clock-o"></i>'+ convertTimestamptoTime(time) + '</h5>'+
                                                '</div>'+
                                                '<hr>'+
                                                '<div class="message-text">' + render_msg(msg, attachment_type) +
                                                '</div>'+
                                            '</div>'+
                                            '<br>'+
                                        '</div>'
                             }
                             else{
                                chat_msg = '<div class="message my-message" id="message-close-' + change.doc.id +'">'+
                                            '<img alt="" class="img-circle medium-image" src="https://bootdey.com/img/Content/avatar/avatar1.png">'+
                                            '<div class="message-body">'+
                                                '<div class="message-info">'+
                                                    '<h4>' +  result['data']['agent_name'] + '</h4>'+
                                                    '<h5><i class="fa fa-clock-o"></i>'+ convertTimestamptoTime(time) + '</h5>'+
                                                '</div>'+
                                                '<hr>'+
                                                '<div class="message-text">' + render_msg(msg, attachment_type) +
                                                '</div>'+
                                            '</div>'+
                                            '<br>'+
                                        '</div>'
                             }

//                             html_to_append += chat_msg
                             document.getElementById("message-chat-close"+ support_match_id).append($.parseHTML(chat_msg)[0])
//                                }
//                                else:
//                                console.log(doc.id);
                        }
                        if (change.type === "modified") {
//                            console.log("Modified city: ", change.doc.data());
                            // as we don't need this
                        }
                        if (change.type === "removed") {
//                            console.log("Removed city: ", change.doc.data());
                            // as we don't need this
                        }
                    });
//                 document.getElementById("message-chat-active"+ support_match_id).innerHTML = html_to_append
            });
        }

        function manage_closed_query(result,action){

                var collQuery= db.collection(result['data']['resolve_query']).orderBy("create_time", "desc")
                    .limit(pageSize);

                switch(action){
                case "first":
                 collQuery= db.collection(result['data']['resolve_query']).orderBy("create_time", "desc")
                    .limit(pageSize);
                 break;
                 case "next":
                 collQuery= db.collection(result['data']['resolve_query']).orderBy("create_time", "desc")
                  .startAfter(lastVisibleClose)
                    .limit(pageSize);
                    break;
                    case "prev":
                   collQuery= db.collection(result['data']['resolve_query']).orderBy("create_time", "desc")
                   .endBefore(firstVisibleClose)
                    .limitToLast(pageSize);
                    break;
                }


            collQuery
            .onSnapshot(function(querySnapshot) {

            if(querySnapshot.docs.length>0){


                var pgStr=pageSize-1;
                $("#close_query_msg>li:gt("+pgStr.toString()+")").remove();
                firstVisibleClose = querySnapshot.docs[0];
                lastVisibleClose = querySnapshot.docs[querySnapshot.docs.length - 1];

            }
            else{
                if(action=="next")
                Swal.fire('There is no next data available');
                if(action=="prev")
                Swal.fire('There is no previous data available');
            }

            // remove loader from the html view
            $('#loading').remove();
            querySnapshot.docChanges().forEach(function(change) {
                if (change.type === "added") {
//                    console.log("New city: ", change.doc.data());
                    var name = change.doc.data()['name'];
                    var msg = change.doc.data()['msg'];
                    var time = change.doc.data()['create_time'];
                    var user_support_id = change.doc.data()['support_match_id'];
                    var number = change.doc.data()['from'];
                    var html = '<li data-toggle="tab" data-target="#sent-message-' + user_support_id  + '" id="close-assign-'+ user_support_id + '">' +
//                                '<div class="message-count">1</div>' +
                                '<img alt="" class="img-circle medium-image" src="https://bootdey.com/img/Content/avatar/avatar1.png">' +
                                '<div class="vcentered info-combo">' +
                                    '<h3 class="no-margin-bottom name"><strong>' +  name + ' | ' + number +  '</strong></h3>' +
//                                            '<h5>' + msg + '</h5>' +
                                '</div>' +
                                '<div class="contacts-add">' +
                                    '<span class="message-time">' + convertTimestamptoTime(time) +'</span>' +

                                '</div>'+
                            '</li>';
                    document.getElementById('close_query_msg').append($.parseHTML(html)[0]);
                    if( is_page_loaded){
                        $("#closed_chat_count").text($("#close_query_msg").children().size());
                    }
                    render_close_chat_content(user_support_id, name, result);

                     $("#close-assign-"+ user_support_id).click(function(e){
                       if( $("#sent-message-"+user_support_id).find("div.chat-body").find("div").last()[0] != null &&
                      $("#sent-message-"+user_support_id).find("div.chat-body").find("div").last()[0] != undefined  )
                            $("#sent-message-"+user_support_id).find("div.chat-body").find("div").last()[0].scrollIntoView();
                      });
                }
                if (change.type === "modified") {
//                    console.log("Modified city: ", change.doc.data());
                }
                if (change.type === "removed") {
                        $("#closed_chat_count").text($("#close_query_msg").children().size());

//                    console.log("Removed city: ", change.doc.data());
//                    var user_support_id = change.doc.data()['support_match_id'];
//                    document.getElementById("sent-message-" + user_support_id) = null;
                }
            });
            });
        }

        function getCookie(name) {
            // Split cookie string and get all individual name=value pairs in an array
            var cookieArr = document.cookie.split(";");

            // Loop through the array elements
            for(var i = 0; i < cookieArr.length; i++) {
                var cookiePair = cookieArr[i].split("=");

                /* Removing whitespace at the beginning of the cookie name
                and compare it with the given string */
                if(name == cookiePair[0].trim()) {
                    // Decode the cookie value and return
                    return decodeURIComponent(cookiePair[1]);
                }
            }
            // Return null if not found
            return null;
        }

function notifyMe(msg) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
        var notification = new Notification('New Message', {
          icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
          body: msg,
        });
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
              // If the user accepts, let's create a notification
              if (permission === "granted") {
                var notification = new Notification('New Message', {
          icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
          body: msg,
        });
              }
        });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
}

//added by sarfaraz alam
function AutoScrollToElem(objScTo){
 if(objScTo){
  objScTo.scrollIntoView();
 }

}
function UpdateNewMessageCountColor(support_match_id){
        var actchtmsgs=$("#message-chat-active"+support_match_id+">div");
        var msgcunter=0;
        for(var i=actchtmsgs.length-1;i>=0;i--){
        var msgtype=$(actchtmsgs[i]).hasClass("message info");
        if(msgtype)
        msgcunter=msgcunter+1;
        else
        break;
        }


var cntitem=$("#active-assign-"+support_match_id).find(".message-count")[0];
if(cntitem){
 var cnt=parseInt(cntitem.innerHTML.trim());
    cntitem.innerHTML=msgcunter;
    ChangeBackgroundColorActiveMsg(support_match_id,"new");
}

var acDtTimeItem=$("#active-assign-"+support_match_id).find(".message-time")[0]
if(acDtTimeItem){
var crDate=acDtTimeItem.innerText.trim();
var sDttm = new Date(moment(crDate, "DD/MM/YYYY hh:mm:ss").toString());
var diffMin=getMinutesDifference(sDttm);

if (diffMin>5){
   var actmsgitem1=$("#active-assign-"+support_match_id)[0];
  actmsgitem1.style.backgroundColor="red";
  }
  else{

      if(msgcunter>0){
        ChangeBackgroundColorActiveMsg(support_match_id,"new");
        }
        else{
         ChangeBackgroundColorActiveMsg(support_match_id,"no");
       }

 }



}

}
function ResetMessageCount(support_match_id){
var cntitem=$("#active-assign-"+support_match_id).find(".message-count")[0];
if(cntitem){
  cntitem.innerHTML=0;
  ChangeBackgroundColorActiveMsg(support_match_id,"no");
}

}
function ChangeBackgroundColorActiveMsg(support_match_id,type){
var actmsgitem=$("#active-assign-"+support_match_id)[0];
if(actmsgitem){
   if(type=="new"){
   actmsgitem.style.backgroundColor="white";
   }

  if(type=="no"){
  actmsgitem.style.backgroundColor="darkgray";
  }

}

}
function ChangeBackgroundColorActiveDelayMsg(support_match_id){
var actmsgs=$('div[id^= "inbox-message-"]');
for(i=0;i<actmsgs.length;i++){
var actinbmsg=actmsgs[i];
var custMsgs=$(actinbmsg).find('div[class^="message info"]');
if(custMsgs&&custMsgs.length>0){
var lastmsg=custMsgs[custMsgs.length-1];
var mdtime=$(lastmsg).find("h5")[0].innerText;

var diffMin=getMinutesDifference(mdtime);
if(diffMin>5){
var actmsgitem1=$("#active-assign-"+support_match_id)[0];
actmsgitem1.style.backgroundColor="red";
}

}

}

}

function getMinutesDifference(startDateTime) {
    var now = moment();
    var duration = moment.duration(now.diff(startDateTime));
    var resultInMinutes = duration.asMinutes();
    return resultInMinutes;
}

function close_query_noreply_cust(from,total_chat_count,support_user_id,support_match_id,department,url, method){


                    var jsonObject=getDataEndChat(support_match_id);
                    var currJsonObject={
                                'from' : from,
                                'total_chat_count' : total_chat_count,
                                'support_user_id': support_user_id,
                                'support_match_id': support_match_id,
                                'department':department
                                };
                    var finalJsonData=Object.assign(currJsonObject,jsonObject)


               $.ajax({
                      type : method,
                        url : url,
                        data:finalJsonData
                                ,
                        success : function(result) {
                            if(result['success']==true){

                            }
                            else{

                            }

                        },
                        error : function(result) {

                         }

                    });

}

function removeActiveChatNodeClose(support_match_id){

    var element = document.getElementById("active-assign-" + support_match_id);
    if(element)
    element.parentNode.removeChild(element);
    $("#active_chat_count").text($("#active_query_msg").children().size());


    //added by sarfaraz
   var messViewElement=document.getElementById("inbox-message-"+support_match_id);
   if(messViewElement)
    messViewElement.parentNode.removeChild(messViewElement);
    //end by sarfaraz

}

function removeUnAssignChatNodeAssign(support_match_id){

        var element = document.getElementById('un-assign-' + support_match_id);
        element.parentNode.removeChild(element);
        $("#un_assign_chat_count").text($("#unassign_msg").children().size());

    //added by sarfaraz
   var messViewElement=document.getElementById("marked-message-"+support_match_id);
   if(messViewElement)
    messViewElement.parentNode.removeChild(messViewElement);
    //end by sarfaraz

}

function manage_active_chat_autoclose(result){

var actAssignMsg=$('#active_query_msg>li');
if(actAssignMsg&&actAssignMsg.length>0){
  for(var i=0;i<actAssignMsg.length;i++){
    var actassMsg=actAssignMsg[i];
    var support_match_id=actassMsg.id.split('-')[2]
    var name=$(actassMsg).find("h3")[0].innerText.split('|')[0].trim();
    var from=$(actassMsg).find("h3")[0].innerText.split('|')[1].trim();
   var actchtmsgs=$("#message-chat-active"+support_match_id+">div");
    if(actchtmsgs&&actchtmsgs.length>0){
    var lstMsg=actchtmsgs[actchtmsgs.length-1];

    var msg_my_side=$(lstMsg).hasClass("message my-message");

    var lstMsgDtTimeItem=$(lstMsg).find("h5")[0];
    if(lstMsgDtTimeItem){
    var crDate=lstMsgDtTimeItem.innerText.trim();
    var sDttm = new Date(moment(crDate, "DD/MM/YYYY hh:mm:ss").toString());
    var diffMin=getMinutesDifference(sDttm);
        if(diffMin>30&&msg_my_side==true){
            close_query_noreply_cust(from,actchtmsgs.length,result["data"]["support_id"]
                ,support_match_id,result["data"]["department"],result["data"]["auto_chat_end_url"]['url'],
                result["data"]["auto_chat_end_url"]['method']);

        }

            }
        }
    }
}

}

function getDataEndChat(support_match_id){
    var firstAvgResTime=getFirstAvgResTime(support_match_id);
    var lastReplyBy=getLastReplyBy(support_match_id);
    var allAvgResTime=getAllAvrResTime(support_match_id);
    var retData={
       "firstAvgResTime":firstAvgResTime,
       "lastReplyBy":lastReplyBy,
       "allAvgResTime":allAvgResTime
    }
    return retData;
}
function getFirstAvgResTime(support_match_id){
 //var msgs=$('#message-chat-active5ea7d52405bc3d0a267b24bf').children();
       var resultInMinutes=0;
       var chatid="#message-chat-active"+ support_match_id;

      var custMsgs=$($(chatid)).find('div[class^="message info"]');
      if(custMsgs&&custMsgs.length>0){
          var firstCustMsg=custMsgs[0];
          var firstCustMsgDtime=$(firstCustMsg).find("h5")[0].innerText;
      }

      var agentMsgs=$($(chatid)).find('div[class^="message my-message"]');
      if(agentMsgs&&agentMsgs.length>0){
          var firstAgentMsg=agentMsgs[0];
          var firstAgentMsgDtime=$(firstAgentMsg).find("h5")[0].innerText;
      }

   if(firstCustMsgDtime&&firstAgentMsgDtime){
   resultInMinutes=getMinutesDiffTwoDates(firstCustMsgDtime,firstAgentMsgDtime);
   resultInMinutes=parseInt(resultInMinutes.toFixed(2));
   }


    return resultInMinutes;

    //alert(resultInMinutes);

}
function getLastReplyBy(support_match_id){
        var chatid="#message-chat-active"+ support_match_id;
        //LastReply By
       var msgs = $(chatid).children();
       var lastmsg=msgs[msgs.length-1];
       var lastMsgeCheck=$(lastmsg).hasClass("message my-message");
       if(lastMsgeCheck===true)
       var lastReplyBy="Agent"
       else
       var lastReplyBy="Customer"

       return lastReplyBy;

       //alert(lastReplyBy);

       //end LastReply By
}
function getAllAvrResTime(support_match_id){

       var chatid="#message-chat-active"+ support_match_id;
       //all average resptim
       var replyCount=0;
       var allAvrTime=0;

       var allAgentMsgs=$($(chatid)).find('div[class^="message my-message"]');

       var allmsgs = $(chatid).children();
       var firstCustMsgDtimeAvr;
       var j=0;
       var k=0;
       for(var i=0;i<allmsgs.length;i++){
           var msg=allmsgs[i];
           var msgCheck=$(msg).hasClass("message my-message");
           if(msgCheck===false &&j==0){
             var custMsgDtimeAvr=allmsgs[i];
           }

            var nextmsg=allmsgs[i+1];
            var nextmsgCheck=$(nextmsg).hasClass("message my-message");
          if(nextmsgCheck===true){
                replyCount++;
                j=0;
                i=i+1;
                var custMsgDtime=$(custMsgDtimeAvr).find("h5")[0].innerText;
                var agentMsgDtime=$(nextmsg).find("h5")[0].innerText;
                var resultMin=getMinutesDiffTwoDates(custMsgDtime,agentMsgDtime);
                if(resultMin)
                allAvrTime=allAvrTime+resultMin;
           }
          else{
             j=1;
            }

            msg=allmsgs[i];
            msgCheck=$(msg).hasClass("message my-message");

            if(i==allmsgs.length-1 && msgCheck==false){
                replyCount++;
                i=i+1;
                var custMsgDtime=$(custMsgDtimeAvr).find("h5")[0].innerText;
                var agentMsgDtime=moment();
                var resultMin=getMinutesDiffTwoDates(custMsgDtime,agentMsgDtime);
                //alert(resultMin);
                if(resultMin)
                allAvrTime=allAvrTime+resultMin;
           }

       }
       var allAvrResTime=0;
       allAvrResTime=parseInt((allAvrTime/replyCount).toFixed(2));
       return allAvrResTime;

       //end all average resptime

}
function getMinutesDiffTwoDates(firstDateTime,secondDateTime) {
    var startDateTime=moment(firstDateTime,"DD/MM/YYYY hh:mm:ss")
    var endDateTime=moment(secondDateTime,"DD/MM/YYYY hh:mm:ss");
    var duration = moment.duration(endDateTime.diff(startDateTime));
    var resultInMinutes = duration.asMinutes();
    return resultInMinutes;
}

//end safaraz alam

<!--        // getting data for the unassigned query-->
<!--        db.collection("{{un_assign_chat}}").get().then((querySnapshot) => {-->
<!--            querySnapshot.forEach((doc) => {-->
<!--                console.log(doc.id);-->
<!--                console.log(doc.data());-->
<!--            });-->
<!--        });-->



<!--         // getting data for the resolve query-->
<!--        db.collection("{{resolve_query}}").get().then((querySnapshot) => {-->
<!--            querySnapshot.forEach((doc) => {-->
<!--                console.log(doc.id);-->
<!--                console.log(doc.data());-->
<!--            });-->
<!--        });-->


