
        var proghtml='<img id="loading" src="img/loader.gif" alt="Loading indicator" style="margin-top: 200px; margin-left: 250px;">'

        $(document).ready(function() {
            $('#loading').remove();
            $('#btnNewUser').hide();

            $('#btnNewUser').show();
            BindGridData();

             $('#btnSearch').click(function(){
              $('#btnNewUser').show();
                        BindGridData();

             });

           $('#btnNewUser').click(function(){
                         clearEditData();
                         $('#actionType').val("add");
                         $('#pPassword').show();
                         $('#pCnPassword').show();
                         $('#editPopupEmail').prop("readonly", false);
                         $('#editModal').modal('show');

                 });




         $('#btnUpdate').click(function(e){
               var vald= $("#usrdetailform").valid();
               if(vald){
               var action_type=$('#actionType').val();


              if(action_type=="add"){
                    var pass=  $('#editPopupPassword').val();
                    var cnfPass= $('#editPopupConfirmPassword').val();
                    if(pass!=cnfPass){
                        alert('Confirm Password is not match')
                        $('#editPopupPassword').val('');
                        $('#editPopupConfirmPassword').val('');
                        return;
                    }
                    UpdateUserDetail(action_type);
                }
                else{
                UpdateUserDetail(action_type);
                }


               }


            });


         });

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

        function un(o) {
                  return o != null ? o : '';
          }

        function bindDepartmentUsers(){
               $.ajax({
                        type : "POST",
                        url : "/get_admin_users",
                        beforeSend: function(xhr){
                                    xhr.setRequestHeader('Authorization', getCookie('token'));
                                    xhr.setRequestHeader('request_type', 'js');
                                    }
                        ,
                        success : function(result) {

                            if (result['data'] == undefined){
                             //  alert(result['message'])
                                window.location.href = '/admin';
                            }
                   else{
                            $('#loading').remove();

                   $("#grid").jqGrid({
                           // colNames: ['Name', 'User Id', 'Support_Id'],
                         colModel: [
                            { name: "name",label:"Name" },
                            { name: "_id",label:"User Id"},
                            {name:"phone",label:"Mobile Number"},
                            {name:"gender",label:"Gender"},
                            {name:"active",label:"Active"},
                            {name:"support_id",label:"Support Id"},
                            {name:"department",hidden:true},
                            {name:"subdepartment",hidden:true},
                            {name:"edt",label:"Edit",search:false,
                            formatter: function (value, grid, row, state)
                            {

                            var lnkbtnHtml='<a class="grdbtn" onclick=\'EditUserDetail("' + row.id  +
                                '")\'><strong>Edit</strong></a>';
                            return lnkbtnHtml

                            }

                            }
                            ],
                            width:'1200px',
                            data: result.data.users,
                            loadonce: false,
                            pager:'#pager',
                            guiStyle: "bootstrap",
                            rowNum: 20,
                            rowList: [20, 30, 40, 50],
                            search:true,
                            sortname: 'name',
                            viewrecords: true,
                            sortorder: "asc"

                        });
                    $('#grid').jqGrid('filterToolbar', { searchOnEnter: true, enableClear: false });

                         /*$("#grid").jqGrid('navGrid', '#pager', {
                                    del: true, add: false, edit: true}
                                );*/


                           }

                        },
                        error : function(result) {

                        }
                    });
        }
        function EditUserDetail(id) {
            clearEditData();
             $('#actionType').val("update");
            var grid_selector = "#grid";
            var model = jQuery(grid_selector).jqGrid('getRowData', id);
             $('#editPopupEmail').val(model._id);
             $('#editPopupName').val(model.name);
             $('#editPopupPhone').val(model.phone);
             $('#editPopupGender').val(model.gender);
             $('#editPopupDepartment').val(model.department);
             $('#editPopupActive').val(model.active);
             $('#editPopupEmail').prop("readonly", true);
             $('#pPassword').hide();
             $('#pCnPassword').hide();


        }
        function BindGridData(){
                $('#datatble').empty();
                $('#tab-content-msg').prepend(proghtml);
                $('#grid').jqGrid('clearGridData');
                $('#grid').GridUnload('#grid');
                bindDepartmentUsers()
        }
        function UpdateUserDetail(action_type){
                     $('#btnUpdate').prop('disabled', true);
                     var email= $('#editPopupEmail').val();
                     var name= $('#editPopupName').val();
                     var phone=$('#editPopupPhone').val();
                     var gender=  $('#editPopupGender').val();
                     var active=  $('#editPopupActive').val();
                     var password= $('#editPopupPassword').val();
                     var data={
                         "email":email,
                         "name":name,
                         "phone":phone,
                         "gender":gender,
                         "active":active,
                         "password":password,
                         "action_type":action_type
                     }

                    $.ajax({
                                type : "POST",
                                url : "/update_user_detail_admin",
                                data: data,
                                beforeSend: function(xhr){
                                    xhr.setRequestHeader('Authorization', getCookie('token'));
                                    xhr.setRequestHeader('request_type', 'js');
                                    },
                                success : function(result) {

                                    if (result['data'] == undefined){
                                      //  alert(result['message'])
                                        window.location.href = '/index_usermanagement';
                                        $('#btnUpdate').prop('disabled', false);
                                    }
                                    else{
                                     if(result['success']&&result['success']==true){
                                         $('#loading').remove();
                                            $('#editModal').modal('hide');
                                            //alert('Action is successful');
                                             Swal.fire('Action is successful');
                                             clearEditData();
                                             BindGridData();
                                     }
                                     else{
                                        $('#btnUpdate').prop('disabled', false);
                                     //  alert(result['message'])
                                     }


                                     }

                                },
                                error : function(result) {
                                    $('#btnUpdate').prop('disabled', false);
                                }
                                 });


        }
        function clearEditData(){
             $('#editPopupEmail').val('');
             $('#editPopupName').val('');
             $('#editPopupPhone').val('');
             $('#editPopupGender').val('');
             $('#editPopupActive').val('');
             $('#editPopupPassword').val('');
             $('#editPopupConfirmPassword').val('');
             $("#usrdetailform").validate().resetForm();
             $('#btnUpdate').prop('disabled', false);
        }
//end search option


