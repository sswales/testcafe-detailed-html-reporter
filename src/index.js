let request = require('request');
let qs = require('querystring');
let Promise = require('bluebird');

export default function () {
  return {
    noColors: false,
    startTime: null,
    afterErrList: false,
    currentFixtureName: null,
    testCount: 0,
    skipped: 0,
    output: '',
    testResult: [],
    agents: '',
    passed: '',
    failed: '',
    testStartTime: '',
    testEndTime: '',
    totalTaskTime: '',
    errorTestData: [],
    creationDate: '',
    PlanName: '',
    PlanID: 0,
    SuiteID: 0,
    ProjectID: 0,
    ProjectName: '',
    ConfigID: [],

    reportTaskStart(startTime, userAgents, testCount) {
      this.startTime = new Date(); // set first test start time

      this.testCount = testCount;

      this.setIndent(2)
        .useWordWrap(true)
        .write(`--------------------------------------------------------------------`)
        .newline()
        .write(`|        Running tests in:`)
        .write(this.chalk.blue(userAgents))
        .write(`|`)
        .newline()
        .write(`--------------------------------------------------------------------`)
        .newline();
      this.agents = userAgents;
      this.testStartTime = new Date();
      this.ProjectName = process.env.PROJECT_NAME;

      this.PlanName = process.env.PLAN_NAME || 'Test-Automatition_1';
    },

    reportFixtureStart(name) {
      this.currentFixtureName = name;
    },

    reportTestDone(name, testRunInfo) {
      this.testEndTime = new Date(); // set test end time
      var hasErr = testRunInfo.errs.length;
      var result = hasErr === 0 ? this.chalk.green(`Passed`) : this.chalk.red(`Failed`);

      var namef = `${this.currentFixtureName} - ${name}`;

      const title = `${result} ${namef}`;

      this.write(title).newline();
      var testOutput = {};

      this.testStartTime = new Date(); // set net test start time
      var testStatus = '';

      if (testRunInfo.skipped) testStatus = `Skipped`;
      else if (hasErr === 0) testStatus = `Passed`;
      else testStatus = `Failed`;

      testOutput[0] = this.currentFixtureName;
      testOutput[1] = name;
      testOutput[2] = testStatus;
      testOutput[3] = this.moment.duration(testRunInfo.durationMs).format('h[h] mm[m] ss[s]');
      var error = {};

      if (testRunInfo.skipped) this.skipped++;

      if (hasErr > 0) {
        error[0] = this.currentFixtureName;
        error[1] = name;
        error[2] = '';
        testOutput[4] = '';
        this._renderErrors(testRunInfo.errs);

        testRunInfo.errs.forEach((err, idx) => {
          error[2] += this.formatError(err, `${idx + 1}) `)
            .replace(/(?:\r\n|\r|\n)/g, '<br />')
            .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
          testOutput[4] += this.formatError(err, `${idx + 1}) `).replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ''
          );
        });

        this.errorTestData.push(error);
      }

      this.testResult.push(testOutput);
    },

    reportTaskDone(endTime, passed) {
      const durationMs = endTime - this.startTime;

      const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');

      this.totalTaskTime = durationStr;
      let footer =
        passed === this.testCount ? `${this.testCount} Passed` : `${this.testCount - passed}/${this.testCount} Failed`;

      footer += ` (Duration: ${durationStr})`;

      if (this.skipped > 0) {
        this.write(this.chalk.cyan(`${this.skipped} Skipped`)).newline();
      }

      this.passed = passed;
      this.failed = this.testCount - passed;

      this.write(footer).newline();

      var d = new Date();

      this.creationDate =
        d.getDate() +
        '_' +
        (d.getMonth() + 1) +
        '_' +
        d.getFullYear() +
        '_' +
        d.getHours() +
        '_' +
        d.getMinutes() +
        '_' +
        d.getSeconds();

      this.generateReport();
    },

    _renderErrors(errs) {
      this.setIndent(3).newline();

      errs.forEach((err, idx) => {
        var prefix = this.chalk.red(`${idx + 1}) `);

        this.newline().write(this.formatError(err, prefix)).newline().newline();
      });
    },

    generateReport() {
      this.output += `<!DOCTYPE html>
							<html>
                            <head>
                            <title>TestCafe HTML Report</title>
                            <script src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js'></script>
                            <meta name='viewport' content='width=device-width, initial-scale=1'>
                            <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'>
                            <script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'></script>
                            <script>
                            var config = {             type: 'pie',             data: {                 datasets: [{                     data: [                         '${
                              this.passed
                            }','${
        this.failed
      }'                     ],                     backgroundColor: [                         'Green',                         'Red'                     ]                 }],                 labels: [                     'Pass',                     'Failed'                 ]             },             options: {                 responsive: true             }         };          window.onload = function() {             var ctx = document.getElementById('myChart').getContext('2d');             window.myPie = new Chart(ctx, config);         }; 
                            </script>
                            </head>
                            <body>
                            <div class='container-fluid'>
                                <div class="row">
                            <div class="col-sm-8">
                                  <div>
                                  <canvas id='myChart' height='80' ></canvas>
                                  </div>
                            </div>
                            <div class="col-sm-2" style=" padding-top:80px">
                                <table class='table table-bordered' >
                                <tr>
                                    <td><b>Passed</b></td>
                                    <td> ${this.passed} </td>
                                </tr>
                                <tr>
                                    <td> <b>Failed </b></td>
                                    <td> ${this.failed} </td>
                                </tr>
                                <tr>
                                    <td> <b>Skipped </b></td>
                                    <td> ${this.skipped} </td>
                                </tr>
                                <tr class='info'>
                                    <td> <b>Total </b></td>
                                    <td> ${this.testCount + this.skipped} </td>
                                </tr>
                                </table>
                            </div>
                          </div>
                            <hr/>
                            
                            
                            <h4>Running tests in: <b>${this.agents}</b>                      <span> Total Time: ${
        this.totalTaskTime
      }</span></h4>
                            <hr/><br/>
                                <h3 style='font-color:red'> Test details</h3>
                                <table class='table table-bordered table-hover'>
                                <thead>
                                <tr>
                                    <th> Fixture Name </th>
                                    <th> Test Name </th>
                                    <th> Status </th>
                                    <th> Time </th>
                                </tr> </thead><tbody>`;

      for (var index in this.testResult) {
        var status = this.testResult[index][2];

        if (status === 'Skipped') status = `<td style='background-color:gray' >Skipped</td>`;
        else if (status === 'Passed') status = `<td style='background-color:green' >Passed</td>`;
        else status = `<td style='background-color:red' >Failed</td>`;

        this.output += `<tr>
                                <td>${this.testResult[index][0]}</td>
                                <td>${this.testResult[index][1]}</td>
                                ${status}
                                <td style='padding-right:0px;border-right:0px;'>${this.testResult[index][3]}</td>
                            </tr>`;
      }

      this.output += `</tbody></table><hr /> <br />`;

      this.output += `<h3 style='font-color:red'> Error details</h3><br /><table class='table table-bordered table-hover'><thead>
                                <tr>
                                    <th> Fixture Name </th>
                                    <th> Test Name </th>
                                    <th> Error </th>
                                </tr></thead><tbody>`;

      for (var i in this.errorTestData) {
        this.output += `<tr>
                                <td>${this.errorTestData[i][0]}</td>
                                <td>${this.errorTestData[i][1]}</td>
                                <td>${this.errorTestData[i][2]}</td>
                                </tr>`;
      }

      this.output += `</tbody></table>
                           </body>
                         </html>`;
      var fs = require('fs');

      var dir = process.env.HTML_REPORT_PATH || `${__dirname}../../../../TestResult`;

      if (!fs.existsSync(dir)) {
        let dirName = '';
        const filePathSplit = dir.split('/');
        for (let index = 0; index < filePathSplit.length; index++) {
          dirName += filePathSplit[index] + '/';
          if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);
        }
      }

      var filename = `Report_${this.creationDate}.html`;

      if (typeof process.env.HTML_REPORT_NAME !== 'undefined') {
        filename = `${process.env.HTML_REPORT_NAME}.html`;
      }

      var file = `${dir}/${filename}`;

      if (typeof process.env.HTML_REPORT_PATH !== 'undefined') {
        file = process.env.HTML_REPORT_PATH + `/${filename}`;
      }

      var isError = false;
      fs.writeFile(file, this.output, function (err) {
        if (err) {
          isError = true;
          return console.log(err);
        }
      });
      if (!isError) {
        this.newline()
          .write('------------------------------------------------------')
          .newline()
          .newline()
          .write(this.chalk.green(`The file was saved at`))
          .write(this.chalk.yellow(file));
      }
    },
  };
}
