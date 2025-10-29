module.exports = {
  default: `--require-module ts-node/register 
             --require src/steps/**/*.ts 
             --format json:src/reports/cucumber_report.json 
             --format html:src/reports/cucumber_report.html 
             src/features/**/*.feature`
};
