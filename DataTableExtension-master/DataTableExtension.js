(function () {
  // HTML 문서가 준비되면 'show', 'destroy' id를 가진 버튼에 클릭 시 실행될 함수 연결
  $(document).ready(function () {
    $("#show-btn").on("click", () => loadData());
  });

  /* 
    <a> </a> 태그를 이루는 문자열 반환
    매개변수로
    {
      href: "http://sameple.com",   - 필수
      tagClass: "primary",             - 없어도 됨
      tagStyle: "display: none;",       - 없어도 됨
      inside: "샘플 닷컴으로 이동"
    }
    을 담아줘야 함
    ------- 그냥 함수 없이 문자열로 "<a href='" + url + "'></a>"
    ------- 작성해도 되지만 가독성과 추후 재사용성을 고려해 함수로 작성
  */
  var anchorTag = (obj) => {
    const _start = "<a ";
    const _href = "href='" + obj.href + "' ";
    const _class = obj.tagClass !== null ? "class='" + obj.tagClass + "' " : "";
    const _style = obj.tagStyle !== null ? "style='" + obj.tagStyle + "'>" : "";
    const _end = "</a>";

    return _start + _href + _class + _style + obj.inside + _end;
  };

  /* 
    <img/> 태그를 이루는 문자열 반환
    매개변수로
    {
      src: "http://sameple.com/asdf.jpg",   - 필수
      tagClass: "primary",             - 없어도 됨
      tagStyle: "display: none;"       - 없어도 됨
    }
    을 담아줘야 함
  */
  var imageTag = (obj) => {
    const _start = "<img ";
    const _src = "src='" + obj.src + "' ";
    const _class = obj.tagClass !== null ? "class='" + obj.tagClass + "' " : "";
    const _style =
      obj.tagStyle !== null ? "style='" + obj.tagStyle + "'/>" : "/>";

    return _start + _src + _class + _style;
  };

  // 데이터 불러와서 DataTable 초기화하는 함수에 넘겨줌
  var loadData = () => {
    // ajax 통신 부분은 추후 Tableau 라이브러리를 통해
    // 데이터를 받아오는 것으로 교체 되어야 함
    $.ajax({
      type: "get",
      // 어차피 Github Pages는 HTTPS라 그냥 다운 받아서 로컬 테스트 해야함 ㅎ
      url: "http://mirs.co.kr:8083/predict?shopcode=1234&id=58086",
      dataType: "json",
      // 데이터를 받아오는 것에 성공하면
      success: function (response) {
        /* 
          response[0]을 한 이유?
            mirs API가 이미 배열인 것을 한번 더 배열로 감싸 보내주기 때문에
            풀어준 것. 일반적으로는 response 그대로 사용해도 될 것임
        */
        // console.log(JSON.stringify(response));
        var dataFromAPI = response[0];

        // DataTables 초기 설정 및 데이터 렌더링
        initializeDataTable(dataFromAPI);
      },
    });
  };

  var initializeDataTable = (dataToRender) => {
    $("#data-table").DataTable({
      // 테이블이 알아서 재초기화 될 수 있도록 삭제 가능하게 설정
      // 이 설정이 없으면 같은 곳에 다시 테이블을 만들 수 없음
      destroy: true,

      // 테이블에 렌더링 될 데이터 지정
      data: dataToRender,

      // 테이블과 페이지 버튼, 부가 기능 버튼 등
      // 배치를 어떻게 할 것인지 작성한 것
      dom: '<"top"fR>t<"bottom"p><"clear"B>',

      /*
        총 4가지의 버튼을 사용할 수 있으며 각각 해당하는 라이브러리를
        DataTables 라이브러리를 다운받을 때 같이 선택하여 다운로드 해야 함
        PDF는 한글 지원이 제대로 되지 않는다. 없애는 게 좋을 듯 

        Column Visualization(컬럼 표시 / 미표시) 기능
        excel : 엑셀로 다운로드 기능
        copy : 복사 기능
        pdf : pdf 다운로드 기능
      */
      buttons: ["colvis", "excel", "copy", "pdf"],

      /*
        한 행을 선택할 수 있음
        위에서 추가한 excel, copy, pdf 기능을 선택한 행에 한해 적용
        "shift / ctrl + click" 을 통해 여러 개 선택 가능
      */
      select: true,

      /*
        data에 JSON key 값을 넣어줌
        columns에 들어간 순서대로 <th>에 차례차례 들어감
        render 함수를 따로 지정해줌으로써 원하는 형태로 삽입할 수 있음
        
        render(data, type, row)
        - data : 해당 컬럼에 들어갈 원래의 JSON value가 들어있음
        - type : https://datatables.net/manual/data/orthogonal-data 참고
        - row : 행에 존재하는 다른 값들에 접근하기 위해 사용
      */
      columns: [
        { data: "GOODS_CODE" },
        {
          data: "GOODS_NAME",
          render: function (data, type, row) {
            return anchorTag({
              // row.GOODS_URL도 가능하지만
              // 키 값이 "GOODS URL" 이었다면 row.GOODS URL은 에러를 발생시키므로
              // 안전하게 다음과 같이 사용
              href: row["GOODS_URL"],
              inside: data,
            });
            // return "<a href='" + row["GOODS_URL"] + "'>" + data + "</a>";
          },
        },
        {
          data: "GOODS_IMG_URL",
          render: function (data, type, row) {
            // 각각 log를 찍어서 어떤 값이 들어있는 지 확인할 수 있음
            // console.log("data is : ", data);
            // console.log("type is : ", type);
            // console.log("row is : ", row);
            if (type === "display") {
              return anchorTag({
                href: row["GOODS_URL"],
                inside: imageTag({
                  src: data,
                  tagStyle: "height: 80px;",
                }),
              });
            } else return data;
          },
        },
        { data: "rating" },
      ],
    });
  };
})();
