"use strict";

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  $(document).ready(function () {
    tableau.extensions.initializeAsync({ configure: configure }).then(
      function () {

        // console.log(tableau.extensions.settings.get("sheetname"));
        if (tableau.extensions.settings.get("sheetname")) {
          // $('#error-log').text(tableau.extensions.settings.get("sheetname"));
          function getdataButton(){
            const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
            var worksheet = worksheets.find(function (sheet) {
                // sheetname 이 setting에 없을때 처리해야함
                console.log(sheet.name);
                return sheet.name === tableau.extensions.settings.get("sheetname");
            });          
            worksheet.getSummaryDataAsync().then(function(sumdata){
            const worksheetData = sumdata;
            var tgt = document.getElementById("dataTarget");
            // var sumdata= JSON.stringify(sumdata);
            

              var datacol = sumdata._data[0];
              
              for (var i = 0; i < sumdata._columns.length; i++) {
              
                if(sumdata._columns[i]._fieldName=="Mkshp Id"){
                  console.log(i);
                  var mIndex = i;
                  console.log(mIndex);
                  console.log(datacol[mIndex]._value);
                  var mkshpvalue= datacol[mIndex]._value;
              
                }
              
              }
              document.getElementById("dk").innerHTML="Mkshp Id는 "+mkshpvalue+" 입니다~~!";

              
              $.ajax({ 
             
                url: 'http://mirs.co.kr:8083/predict', //API의 url
                dataType: 'json', //데이터 타입 지정
                type:'post', //post 방식 사용
                data : {
                            "shopcode" : 1,
                            "id" : mkshpvalue
                    }, //post로 api와 통신할 데이터
                success: function(data) { 
                            
                    data=data[0];
                    console.log(data);
                            
                    var image1 = new Array();
                    var goods1 = new Array();
                    var link1 = new Array();
        
                        for (var key in data) {
                        
                                image1.push(data[key].GOODS_IMG_URL);
                                goods1.push(data[key].GOODS_NAME);
                                link1.push(data[key].GOODS_URL);
        
                        }
                        //set_info는 배열의 1번째~n번째 웹페이지 이미지,상품이름,상품링크를 호출하는 함수이다.
                        function setInfo() {
                            
                        for (var i = 0; i <= 2; i++) {
                                document.getElementById('title' + i).src = image1[i];
                                document.getElementById('good' + i).innerHTML = goods1[i];
                                document.getElementById('link' + i).href = link1[i];
                                document.getElementById('pid1').innerHTML = mkshpvalue+" 님을 위한 추천 상품";
                            }
        
                        }
                    
                    setInfo();
        
        
                    },   ///api와 통신 성공시 실행될 함수
                    error: function (request, status, error) {
                        console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                    }  // api와 통신 실패시 실행될 함수
                    
            });
              //여기에 ajax 구문 써야함

              // $.ajax({

              // });



            tgt.innerHTML = "<h4 id='printdata'>출력된 데이터:</h4><p>"+sumdata+"</p>";
          }
        )}
      
          getTESTBtn.addEventListener('click', function () {getdataButton(); });
          var targ = document.getElementById("dataTarget2");
          targ.insertBefore(getTESTBtn, targ.childNodes[0]);
          // getdataCell.appendChild(getdataBtn);
          // infoCell.appendChild(infoSpan);
          
        }
      },
      function (err) {
        // 초기화 중 에러 발생
        console.log("초기화 중에 에러 발생 : " + err.toString());
      }
    );

    /*
      익명 함수로 묶어서 변수명 등이 겹치는 것을 막는 대신,
      이 묶인 것 안에서 이 js 파일 내의 "함수들"과 "버튼"을 연결해줘야 함수가 돌아감
      익명 함수이기 때문에 이 묶인 부분을 벗어나면 호출할 방법이 없기 때문
      html에서도 단순히 
      <button onclick="configure()">asdf</button> 
      로 하면 돌아가지 않는 이유이기도 함
    */
    // 구성 기능을 버튼에도 둘 수 있음
    $("#configure-button").on("click", () => configure());
  });

  // 구성 버튼을 눌렀을 때 실행되는 함수
  function configure() {
    // 다이얼로그의 html 파일 경로 지정 = 편의상 상대경로로 지정해두었음 : 변경 필요
    const popupUrl = "./WorksheetSelectorDialog.html";

    // 다이얼로그에게 전달해주고 싶은 값
    var myOpenPayload = "Msg from parent";
    // 전달할 게 없다면 " " 공백 하나를 넣어 보내면 되고,
    // var myOpenPayload = " ";
    // 혹은 displayDialogAsync에서 아예 빼고 실행시켜도 됨
    // var myOpenPayload = {
    //   val : "객체도 전달할 수 있음"
    // };

    tableau.extensions.ui
      .displayDialogAsync(popupUrl, myOpenPayload, {
        height: 500,
        width: 500,
      })
      .then((closePayload) => {

        onDialogFinished(closePayload);
      })
      .catch((error) => {
        // 에러 코드에 따라 처리
        switch (error.errorCode) {
          // 사용자가 창의 X 버튼을 눌러 강제 종료한 경우
          case tableau.ErrorCodes.DialogClosedByUser:
            var date = new Date();
            var logText =
              date.getHours() +
              "시 " +
              date.getMinutes() +
              "분 : 사용자가 X 눌러 종료함";
            const log = $("<p>" + logText + "</p>");
            $("#error-log").append(log);
            break;

          // 기타 에러 발생한 경우
          default:
            $("#error-log").append(error.message);
        }
      });
  }

  // 다이얼로그가 성공적으로 종료되면 실행되는 함수
  function onDialogFinished(dialogData) {
    var pElement = $("<p>" + "선택한 워크시트: "+dialogData + "</p>");

    $("#from-dialog").append(pElement);
    $("#from-dialog").html(pElement);

   //새로 추가한 함수




  }
})();
