$(document).ready(function() {

           $('#loading').remove();
           $('#clndrs').hide();
           var proghtml='<img id="loading" src="img/loader.gif" alt="Loading indicator" style="margin-top: 200px; margin-left: 250px;">'

                $.ajax({
                type : "POST",
                url : "/auth_admin",
                beforeSend: function(xhr){
                    xhr.setRequestHeader('Authorization', getCookie('token'));
                    xhr.setRequestHeader('request_type', 'js');
                    },
                success : function(result) {
//                    console.log(result)
                    if (result['data'] == undefined){
                        alert(result['message'])
                        $('#loading').remove();
                        window.location.href = '/admin';

                    }
                    else{

                    $.ajax({
                        type : "POST",
                        url : "/get_departments",
                        beforeSend: function(xhr){
                            xhr.setRequestHeader('Authorization', getCookie('token'));
                            xhr.setRequestHeader('request_type', 'js');
                            },
                        success : function(result) {
        //                    console.log(result)
                            if (result['data'] == undefined){
                                alert(result['message'])
                                window.location.href = '/admin';
                            }
                            else{
                                $('#loading').remove();

                                bindDepartmentDropDown(result);



                             }

                        },
                        error : function(result) {

                        }
                         });





                     }

                },
                error : function(result) {
                   $('#loading').remove();
                }
                 });




        $('#btnSearch').click(function(){
                $('#datatble').empty();
                $('#tab-content-msg').prepend(proghtml);
                $('#grid').jqGrid('clearGridData');
                $('#grid').GridUnload('#grid');

                if($('#ddlsearchtype').val()=="Custom Date"){

                if($('#txtStartDate').val()==""){
                    alert("please select start date");
                    $('#loading').remove();
                    return;
                }
                if($('#txtEndDate').val()==""){
                    alert("please select end date");
                    $('#loading').remove();
                    return;
                }
                var selStartDate=$('#txtStartDate').val();
                var selEndDate=$('#txtEndDate').val();
                startDate = moment(selStartDate,"DD/MM/YYYY").startOf('day').utc().format()
                endDate = moment(selEndDate,"DD/MM/YYYY").endOf('day').utc().format();
                 var duration = moment.duration(moment(endDate).diff(moment(startDate)));
                   var resultInDays = duration.asDays();
                   if(resultInDays>31){
                   alert('Please select date between 1 to 31 days');
                   $('#loading').remove();
                   return;
                   }
                   if(resultInDays<0){
                   alert('Please select correct start or end date');
                   $('#loading').remove();
                    return;
                   }
                }
                else{
                $('#clndrs').hide();
                }

          var selectedDepartment= $('#ddl_departments').val();

          if(!selectedDepartment){
          alert('Please select department');
          }

          // Clearing grid2 data
          $('#grid2').jqGrid('clearGridData');
          $('#grid2').GridUnload('#grid2');
          $("#grid2Title").text("")

            $.ajax({
                type : "POST",
                data:{
                 "searchtype": $('#ddlsearchtype').val(),
                 "startDate": startDate,
                 "endDate": endDate,
                 "department":selectedDepartment
                },
                url : "/get_productivity_report",
                beforeSend: function(xhr){
                    xhr.setRequestHeader('Authorization', getCookie('token'));
                    xhr.setRequestHeader('request_type', 'js');
                    },
                success : function(result) {
//                    console.log(result)
                    if (result['data'] == undefined){
                       // alert(result['message'])
                        //window.location.href = '/login';
                          $('#loading').remove();
                    }
                    else{
                        $('#loading').remove();
                        $('#datatble').empty();

                          $('#grid').jqGrid('clearGridData');
                          $('#grid').GridUnload('#grid');
                          //$("#grid").jqGrid("setGridParam", {datatype: "json"});
                          //$('#grid').trigger('reloadGrid');

                        $("#grid").jqGrid({
                            colModel: [
                                { 
                                    name: "Executive Name",
                                },
                                {   name: "Current Status",
                                },
                                {
                                    name: "Total Assigned",
                                    formatter: jqGridBtnFormatter
                                },
                                {
                                    name: "Total Solved",
                                    formatter: jqGridBtnFormatter
                                },
                                { 
                                    name: "Total Solved (Ended by Executive)",
                                    formatter: jqGridBtnFormatter },
                                { 
                                    name: "Total Solved (Ended by Customer)",
                                    formatter: jqGridBtnFormatter
                                },
                                { 
                                    name: "Total Solved  (Last reply by Customer)",
                                    formatter: jqGridBtnFormatter
                                },
                                { 
                                    name: "Total Solved  (Last reply by Executive)",
                                    formatter: jqGridBtnFormatter
                                },
                                { 
                                    name: "Total Solved (Auto Solved)", 
                                    formatter: jqGridBtnFormatter,
                                },
                                { 
                                    name: "Total Solved (Auto Closed)", 
                                    formatter: jqGridBtnFormatter
                                },
                                {   
                                    name: "Average Response Time (First Response)",
                                },
                                {   
                                    name: "Average Response Time (All Responses)",
                                }

                            ],
                            data: result.data.total_assigned_data,
                            loadonce: false

                        });






                        /*for(var i=0;i<result.data.total_assigned_data.length;i++){
                             var usrdata=result.data.total_assigned_data[i];

                             var htmlstr="<tr class='dttr'>"+
                             "<td style='width:10%'>"+ un(usrdata['agent_name'])+"</td>";
                             for(var j=0;j<usrdata['chats_detail'].length;j++){
                                 var chatdata=usrdata['chats_detail'][j];
                                    htmlstr+=
                                    "<td class='dttd'><span>"+ chatdata['status']+"</span>"+
                                    "<span class='ctcnt'>"+ chatdata['count']+"</span>";
                                    if(chatdata['match_status']==3){
                                    htmlstr+=
                                     "<span class='ctcnt'>FirstAvgResTime: "+ un(chatdata['firstAvgResTime'])+"</span>"+
                                     "<span class='ctcnt'>AllAvgResTime:"+ un(chatdata['allAvgResTime'])+"</span>"

                                    }
                                   "</td>";
                             }
                             var tdlength=5-usrdata['chats_detail'].length;
                             for(var k=0;k<tdlength;k++){
                               htmlstr+="<td>"+ "" +"</td>";
                             }



                           htmlstr+= "</tr>";
                            $('#datatble').append(htmlstr);
                        }*/



                     }

                },
                error : function(result) {
                   $('#loading').remove();
                }
                 });

                 });



         $('#ddlsearchtype').change(function(e){
             var selDuration=$('option:selected', this).val();
             $('#clndrs').hide();
             switch(selDuration){
              case "Last Hour":
                startDate = moment().startOf('hour').utc().format() // set to 12:00 am today
                endDate = moment().endOf('hour').utc().format()
                break;
               case "Today":
                startDate = moment().startOf('day').utc().format() // set to 12:00 am today
                endDate = moment().endOf('day').utc().format()
                break;
                case "Yesterday":
                startDate = moment().subtract(1,'days').startOf('day').utc().format() // set to 12:00 am today
                endDate = moment().subtract(1,'days').endOf('day').utc().format()
                break;
                case "This Month":
                startDate = moment().startOf('month').utc().format() // set to 12:00 am today
                endDate = moment().endOf('month').utc().format()
                break;
                case "Last Month":
                startDate = moment().subtract(1,'month').startOf('month').utc().format() // set to 12:00 am today
                endDate = moment().subtract(1,'month').endOf('month').utc().format()
                break;
                case "Custom Date":
                $('#clndrs').show();
                break;
               }

          });

         });

function bindDepartmentDropDown(result){
        $("#ddl_departments").empty();
        $.each(result.data.admin_departments, function (key, value) {
            if(key=="b2c")
            $("#ddl_departments").append($("<option selected=true></option>").val(key).html(value));
            else
            $("#ddl_departments").append($("<option></option>").val(key).html(value));
         });
          //$("#ddl_departments").change();
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

function un(o) {
          return o != null ? o : '';
        }

//end search option


// Generic Grid Format Function 
function jqGridBtnFormatter(cellvalue, options, rowObject) {
    var colName = options && options.colModel && options.colModel.name ? options.colModel.name : null;
    var support_user_id = rowObject._id
    var clientName = rowObject["Executive Name"]

    return `<a title='Click to do something'
    style="color: #2e6e9e;"
    href='#' onclick=\"jqGridClicked(\'${clientName}','${support_user_id}','${colName}\');return false;\"><u>${cellvalue}</u></a>`;
}

// Generic Grid Column Clicked Function
function jqGridClicked(clientName,support_user_id, colName) {
    var selDuration=$('option:selected', '#ddlsearchtype').val();
    
    console.log("selDuration", selDuration);
    console.log("support_user_id", support_user_id);
    console.log("colName", colName);

    if(selDuration == "Custom Date"){
        var selStartDate=$('#txtStartDate').val();
        var selEndDate=$('#txtEndDate').val();
        startDate = moment(selStartDate,"DD/MM/YYYY").startOf('day').utc().format()
        endDate = moment(selEndDate,"DD/MM/YYYY").endOf('day').utc().format();    
    }
    

    var selectedDepartment= $('#ddl_departments').val();
    console.log("startDate",startDate)
    console.log("endDate",endDate)
    console.log("selectedDepartment",selectedDepartment)
    console.log("searchtype",$('#ddlsearchtype').val())
    $.ajax({
        type: "POST",
        data: {
            "support_user_id": support_user_id, 
            "colName": colName,
            "searchtype": $('#ddlsearchtype').val(),
            "startDate": startDate,
            "endDate": endDate,
            "department": selectedDepartment
        },
        url: "/chat_info",
        // beforeSend: function (xhr) {
        //     xhr.setRequestHeader('Authorization', getCookie('token'));
        //     xhr.setRequestHeader('request_type', 'js');
        // },
        success: function (result) {
            if (result['data'] == undefined) {
                $('#loading').remove();
            }
            else {
                $('#loading').remove();
                var resultData = result['data']
                console.log(resultData)
                
                var grid2Title = `${clientName}: ${support_user_id} (${colName})`
                $("#grid2Title").text(grid2Title)

                $('#grid2').jqGrid('clearGridData');
                $('#grid2').GridUnload('#grid2');
                $("#grid2").jqGrid({
                    colModel: [
                        { name: "_id",label:'Chat Id',width:"180" },
                        { name: "booking_id", label:"Booking Id" },
                        { name: "user_type", label:"User Type"},
                        { name: "user_id", label:"User Id" },
                        { name: "email_phone", label:"Email",width:"180" },
                        { name: "isAutoAssign", label:"Auto Assign" },
                        { name: "match_time", label:"Matched Time",width:"190",formatter: jqGridDateFormatter},
                        { name: "create_time", label:"Created Time",width:"190",formatter: jqGridDateFormatter },
                        { name: "disposition_category", label:"Disposition Category"},
                        { name: "disposition_sub_category", label:"Disposition Sub Category"}
                    ],
                    data: resultData.json_docs,
                    loadonce: false

                }).trigger('reloadGrid');

            }

        },
        error: function (result) {
            $('#loading').remove();
        }
    });

}

// Generic Grid Format Function 
function jqGridDateFormatter(cellvalue, options, rowObject) {
    var timeValue = convertTimestamptoTime(cellvalue);
    return timeValue;
}


function convertTimestamptoTime(unixTimestamp) {
    // then create a new Date object
    dateObj = new Date(unixTimestamp);
    var cDate = dateObj.getDate();
    var cMonth = dateObj.getMonth() + 1;
    var cYear = dateObj.getFullYear();

    var cHour = dateObj.getHours();
    var cMin = dateObj.getMinutes();
    var cSec = dateObj.getSeconds();
    var date_to_return = cDate.toString().padStart(2, "0") + "/"
        + cMonth.toString().padStart(2, "0") + "/" + cYear + " " + cHour.toString().padStart(2, "0")
        + ":" + cMin.toString().padStart(2, "0") + ":" + cSec.toString().padStart(2, "0")
    return date_to_return
}