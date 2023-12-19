const UglifyJS = require('uglify-js');
const glob = require('glob');
const fs = require('fs');
const path = require('path');

const srcDirectory = 'src';
const distDirectory = 'build';



const folderstoctreate=['api','common','logger','s3','fsm'];
if (!fs.existsSync(distDirectory)) {
  fs.mkdirSync(distDirectory);
}

folderstoctreate.forEach(folder=>{
  const folderpath=path.join(distDirectory, folder);
  if(!fs.existsSync(folderpath)){
    fs.mkdirSync(folderpath);
  }
});


const files = glob.sync(`${srcDirectory}/**/*.js`);


files.forEach((file) => {
  try {
    const content = fs.readFileSync(file, 'utf8');

    if (content === undefined) {
      throw new Error(`Empty content in file: ${file}`);
    }

    const outputPath = path.join(distDirectory, path.relative(srcDirectory, file));

    const result = UglifyJS.minify(content);

    if (result.error) {
      throw result.error;
    }
    
 const filename=path.basename(file);

 if (filename === 'pbx_config.js') {
  // Move pbx_config.js build outside dist directory
  
  fs.writeFileSync(`../${filename}`, result.code);
  console.log(`Moved ${filename} build outside build`);
}
else if(filename==='pbx_api.js'){
  fs.writeFileSync(path.join(distDirectory, 'api', filename),result.code);
}
 else if(filename==='datetime.js'){
    fs.writeFileSync(path.join(distDirectory, 'common', filename),result.code);
  }
 else if (['state_machine.js','pbx_agent_outgoing_parallel_ringing.js', 'pbx_agent_outgoing.js', 'pbx_agent_transfer.js', 'pbx_hangup_state.js'].includes(filename)) {
  fs.writeFileSync(path.join(distDirectory, 'fsm', filename),result.code);
} else if(['pbx_cdr.js','pbx_logger.js'].includes(filename)) {
  fs.writeFileSync(path.join(distDirectory, 'logger', filename),result.code);
} else if(filename==='awsS3.js'){
  fs.writeFileSync(path.join(distDirectory, 's3', filename),result.code);
}else{
  fs.writeFileSync(outputPath, result.code);
}
// fs.writeFileSync(path.join(distDirectory,filename),result.code);
console.log(`Minified ${file} to ${outputPath}`);
  }catch(error){
    console.error(`Error minifying ${file}:${error}`);
  }
});
