# testcafe-reporter-detailed-html

![TestCafe](https://community.devexpress.com/blogs/aspnet/16.1Release/TestCafeLogo.png)

This is the **detailed-html-reporter** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

## Install

```
npm install testcafe-reporter-detailed-html
```

## Usage

When you run tests from the command line, you can use by adding the `--reporter` option:

For example:
```
testcafe chrome 'path/to/test/file.js' --reporter detailed-html
```

When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('detailed-html') // <-
    .run();
```

## Additional Configuration

#### For HTML Report
``` 
HTML_REPORT_PATH : set the report output folder | default: Node_modules's (in where plugin is installed) sibling folder
HTML_REPORT_Name : set the report name | default: Report_TIMESTAMP.html (e.g.: Report_16_5_2018_14_46_46.html)
```

##### Format:

```
test('<< Group Name>> | << Test Name >> | << Testrail Case_ID >> ', async t => { .... });

<< Group Name >> - It can be any like Smoke, sanity, functional.
<< Test Name >>  - Test name of that test cases
<< Testrail Case_ID >>  - case ID of testrail's test case (The testcase should be present in the given PROJECT_NAME)

Example:

test('Smoke | Verify the Login Page | C875986 ', async t=> { ... });
```

##### Environment Variables
```
PROJECT_NAME : project name
PLAN_NAME : plan name | default: TestAutomation_1
```
 
