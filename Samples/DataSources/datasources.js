'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  $(document).ready(function () {
    tableau.extensions.initializeAsync().then(function () {
      // Since dataSource info is attached to the worksheet, we will perform
      // one async call per worksheet to get every dataSource used in this
      // dashboard.  This demonstrates the use of Promise.all to combine
      // promises together and wait for each of them to resolve.
      let dataSourceFetchPromises = [];
      const savedSheetName = tableau.extensions.settings.get('sheet');
      // Maps dataSource id to dataSource so we can keep track of unique dataSources.
      let dashboardDataSources = {};

      // To get dataSource info, first get the dashboard.
      const dashboard = tableau.extensions.dashboardContent.dashboard;

      // Then loop through each worksheet and get its dataSources, save promise for later.
      dashboard.worksheets.forEach(function (worksheet) {
        dataSourceFetchPromises.push(worksheet.getDataSourcesAsync());
      });

      Promise.all(dataSourceFetchPromises).then(function (fetchResults) {
        fetchResults.forEach(function (dataSourcesForWorksheet) {
          dataSourcesForWorksheet.forEach(function (dataSource) {
            if (!dashboardDataSources[dataSource.id]) { // We've already seen it, skip it.
              dashboardDataSources[dataSource.id] = dataSource;
            }
          });
        });

        buildDataSourcesTable(dashboardDataSources);

        // This just modifies the UI by removing the loading banner and showing the dataSources table.
        $('#loading').addClass('hidden');
        $('#dataSourcesTable').removeClass('hidden').addClass('show');
      });
    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
  });

  // Refreshes the given dataSource.
  // function refreshDataSource (dataSource) {
  //   dataSource.refreshAsync().then(function () {
  //     console.log(dataSource.name + ': Refreshed Successfully');
  //   });
  // }

  function getdataButton (dataSource) {
    const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
    // alert(JSON.stringify(newworksheets));
    // Find a specific worksheet
    var worksheet = worksheets.find(function (sheet) {
      return sheet.name === "유저리스트필터링";
    });   
    worksheet.getSummaryDataAsync().then(function (sumdata) {

      
      const worksheetData = sumdata;
      var tgt = document.getElementById("dataTarget");
      var sumdata = JSON.stringify(sumdata);


      tgt.innerHTML= "<h4>출력된 데이터:</h4><p>"+sumdata+"</p>";
      

  });
}
  // function getdataButton (dataSource) {
   
  //   worksheet.getSummaryDataAsync().then(function (sumdata) {
  //     const worksheetData = sumdata;

  //       var tgt = document.getElementById("dataTarget");
  //       tgt.innerHTML= "<h4>출력된 데이터:</h4><p>"+JSON.stringify(sumdata.getData())+"</p>";
  //     // The getSummaryDataAsync() method returns a DataTable
  //     // Map the DataTable (worksheetData) into a format for display, etc.
      
  //    });

  // }



  // Displays a modal dialog with more details about the given dataSource.
  function showModal (dataSource) {
    let modal = $('#infoModal');

    $('#nameDetail').text(dataSource.name);
    $('#idDetail').text(dataSource.id);
    $('#typeDetail').text((dataSource.isExtract) ? 'Extract' : 'Live');

    // Loop through every field in the dataSource and concat it to a string.
    let fieldNamesStr = '';
    dataSource.fields.forEach(function (field) {
      fieldNamesStr += field.name + ', ';
    });

    // Slice off the last ", " for formatting.
    $('#fieldsDetail').text(fieldNamesStr.slice(0, -2));

    dataSource.getConnectionSummariesAsync().then(function (connectionSummaries) {
      // Loop through each connection summary and list the connection's
      // name and type in the info field
      let connectionsStr = '';
      connectionSummaries.forEach(function (summary) {
        connectionsStr += summary.name + ': ' + summary.type + ', ';
      });

      // Slice of the last ", " for formatting.
      $('#connectionsDetail').text(connectionsStr.slice(0, -2));
    });

    dataSource.getActiveTablesAsync().then(function (activeTables) {
      // Loop through each table that was used in creating this datasource
      let tableStr = '';
      activeTables.forEach(function (table) {
        tableStr += table.name + ', ';
      });

      // Slice of the last ", " for formatting.
      $('#activeTablesDetail').text(tableStr.slice(0, -2));
    });

    modal.modal('show');
  }

  // Constructs UI that displays all the dataSources in this dashboard
  // given a mapping from dataSourceId to dataSource objects.
  function buildDataSourcesTable (dataSources) {
    // Clear the table first.
    $('#dataSourcesTable > tbody tr').remove();
    const dataSourcesTable = $('#dataSourcesTable > tbody')[0];

    // Add an entry to the dataSources table for each dataSource.
    for (let dataSourceId in dataSources) {
      const dataSource = dataSources[dataSourceId];

      let newRow = dataSourcesTable.insertRow(dataSourcesTable.rows.length);
      // let nameCell = newRow.insertCell(0);
      // let refreshCell = newRow.insertCell(1);
      let getdataCell = newRow.insertCell(0);
      let infoCell = newRow.insertCell(1);

      let refreshButton = document.createElement('button');
      refreshButton.innerHTML = ('Refresh Now');
      refreshButton.type = 'button';
      refreshButton.className = 'btn btn-primary';
      refreshButton.addEventListener('click', function () { refreshDataSource(dataSource); });

      // let getdataBtn = document.createElement('button');
      // getdataBtn.innerHTML = ('GET DATA!');
      // getdataBtn.type = 'button';
      // getdataBtn.className = 'btn btn-info';
      // getdataBtn.addEventListener('click', function () { getdataButton(dataSource); });

      let getTESTBtn = document.createElement('button');
      getTESTBtn.innerHTML = ('GET DATA');
      getTESTBtn.type = 'button';
      getTESTBtn.className = 'btn btn-info';
      getTESTBtn.addEventListener('click', function () { getdataButton(dataSource); });
      var targ = document.getElementById("dataTarget2");
      targ.insertBefore(getTESTBtn, targ.childNodes[0]);
      // targ.innerHTML= "<h4>출력된 데이터:</h4><p>"+sumdata+"</p>";

      // let infoSpan = document.createElement('span');
      // infoSpan.className = 'glyphicon glyphicon-info-sign';
      // infoSpan.addEventListener('click', function () { showModal(dataSource); });

      // nameCell.innerHTML = dataSource.name;
      // refreshCell.appendChild(refreshButton);
      getdataCell.appendChild(getdataBtn);
      infoCell.appendChild(infoSpan);
    }
  }
})();