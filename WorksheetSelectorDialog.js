"use strict";

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {

  const settingsKey = 'sheetname';

  $(document).ready(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      // 부모가 openpayload에 담아준 값 확인
      $("#from-parent").text(openPayload);

      // 태블로 객체이므로, 초기화 완료 시 수행되는 이 공간에서 dashboard를 얻던
      // worksheets를 얻던 해야함
      const worksheets =
        tableau.extensions.dashboardContent.dashboard.worksheets;

      // 대시보드 내의 여러 워크 시트 각각에 대해
      worksheets.forEach((sheet) => {
        // 시트의 이름으로 된, 시트의 이름을 부모에게 반환하는 버튼 생성
        let btn = makeButton(sheet.name);
        // 원하는 영역에 붙이기
        $("#select-worksheet-area").append(btn);
      });
    });

    // 마지막으로, 선택 취소 버튼에 선택 취소(종료) 함수 연결
    $("#cancel-selection").on("click", () => close());
  }); // -----여기까지가 $(document).ready(...); 임

  /*
    고른 시트 버튼을 누르면 실행되는 함수로, 
    간단히 closeDialog() 호출하여 부모에게 값 전달
  */
  function selected(sheetName) {
    tableau.extensions.settings.set(settingsKey, sheetName);
    tableau.extensions.settings.saveAsync().then(result => {
      tableau.extensions.ui.closeDialog(sheetName);
      console.log('Settings saved.');
      // ... process results
   })
  }



 /* 
    참고로 X를 누르면 에러로 인식되는 반면,
    closeDialog() 함수를 이용하면 에러가 아님
  */
  function close() {
    tableau.extensions.ui.closeDialog("버튼을 눌러 종료하였음.");
  }

  /*
    단순히 버튼 객체를 만드는 함수
    <div> 같은 특정 영역에 append 해줘야 보임
  */
  function makeButton(sheetName) {
    const button = $("<button></button>");
    button.text(sheetName + " 선택");
    button.addClass("btn btn-block btn-default");
    // sheetName을 그대로 부모에게 반환하며 종료하는 함수 연결
    button.on("click", () => selected(sheetName));
    return button;
  }
})();
