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
            var sumdata= JSON.stringify(sumdata);
            
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
    const popupUrl = "https://km20646.github.io/tableautest/WorksheetSelectorDialog.html";

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
