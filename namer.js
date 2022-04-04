import fs from "fs"
import path from "path"
import glob from "glob"
import dateFormat, { masks } from "dateformat";
import {ExifParserFactory} from "ts-exif-parser";

import prompt from "prompt-sync"


function createdDate (file) {  
  const { birthtime } = fs.statSync(file)
  return birthtime
}

function checkMobile(file, renames) {
	const basename = path.basename(file)
	if(RegExp("^IMG_\\d\\d\\d\\d\\d\\d\\d\\d_(.+)$").test(basename)) {				
		const outName = path.join(path.dirname(file),"IMG_"+basename.substr(4,4)+"-"+basename.substr(8,2)+"-"+basename.substr(10,2)+basename.substr(12))
		renames.push([file, outName, "M"]);
	}
}

function checkCanon(file, renames) {
	const basename = path.basename(file)
	if(RegExp("^IMG(_....)\.((JPG)|(jpg))$").test(basename)) {		
		const creationDate = getCreationDate(file);
		const dateToUse = (creationDate == undefined ? createdDate(file) : new Date(creationDate*1000));	
		const outName = path.join(path.dirname(file),"IMG_"+dateFormat(dateToUse, "yyyy-mm-dd")+basename.substr(3,5)+".jpg")
		renames.push([file, outName, "C"]);
	}
}

function checkLG(file, renames) {
	const basename = path.basename(file)
	if(RegExp("^\\d\\d\\d\\d\\d\\d\\d\\d_.+$").test(basename)) {		
		const outName = path.join(path.dirname(file),"IMG_"+basename.substr(0,4)+"-"+basename.substr(4,2)+"-"+basename.substr(6,2)+basename.substr(8))
		renames.push([file, outName, "M"]);
	}
}

function checkWhatsApp(file, renames) {
	const basename = path.basename(file)
	
	if(RegExp("^IMG-\\d\\d\\d\\d\\d\\d\\d\\d(-WA.+)$").test(basename)) {				
		const outName = path.join(path.dirname(file),"IMG_"+basename.substr(4,4)+"-"+basename.substr(8,2)+"-"+basename.substr(10,2)+basename.substr(12))
		renames.push([file, outName, "W"]);
	}
}

function readEXIFdata(file) {
	const buf = fs.readFileSync(file);
    return ExifParserFactory.create(buf).parse();
}

function getCreationDate(file) {
	const exifData = readEXIFdata(file);
	const creationDate = exifData.tags.DateTimeOriginal;
	return creationDate;
}

function generateArrayOfRenames(path) {
	console.log("- Checking files to rename...");
	const files = glob.sync(path+"/**/*.*", null);
	const renames = [];		
	files.forEach(function(file) {
		checkLG(file, renames);
		checkCanon(file, renames);
		checkMobile(file, renames);
		checkWhatsApp(file, renames);
	});
	console.log("  "+renames.length+" files to rename.\n");
	return renames;
}

function checkForErrors(renames, checkCollisions) {	
	let errors = 0;
	console.log("- Checking possible renaming issues...");
	renames.forEach(function(rename) {
		if(fs.existsSync(rename[1])) {
			errors++;
			console.log("  ERROR: File "+rename[1]+" already exists");
		}
	});	
	if(checkCollisions) {		
		const renamesLength = renames.length;
		for(let i=0; i<renamesLength; i++) {
			for(let j=i+1; j<renamesLength; j++) {
				if(renames[i][1] == renames[j][1]) {
					console.log("  ERROR: Files "+renames[i][0]+" and "+renames[j][0]+" will be renamed both as "+renames[i][1]);
					errors++;
				}
			}
		}
	}
	console.log("  "+errors+" errors found.\n");		
	return (errors==0)
}

function listRenames(renames) {
	console.log("- Files to be renamed:");
	renames.forEach(function(rename) {
		console.log("  "+rename[2]+" "+rename[0]+" → "+rename[1]);		
	});
}

function performRenames(renames) {
	console.log("- Renaming:");
	let errorsCount = 0;
	let rensCount = 0;
	renames.forEach(function(rename) {
		fs.rename(rename[0], rename[1], function(err) {
			if ( err ) {
				console.log('  ERROR renaming '+rename[0]+': ' + err);
				errorsCount++;
			} else {
				console.log("  "+rename[2]+" "+rename[0]+" → "+rename[1]+" Ok.");		
				rensCount++;
			}
		});
	});
	console.log("  "+rensCount+" sucessfull renaming operations done with "+errorsCount+" errors");
}

let prompter = prompt();
let workingPath = process.argv[2] ? process.argv[2] : prompter('Path with files to rename (CWD by default): ');
if (workingPath=="") {
	workingPath = "./";
}
console.log('Working path is '+workingPath);
const renames = generateArrayOfRenames(workingPath);
if(renames.length>0) {
	const valid = checkForErrors(renames, false);
	if(valid) {
		listRenames(renames);
		console.log("\n");
		let confirmation = prompter('Do you want to continue? (y/n) ');
		if(confirmation.toUpperCase() == "Y") {
			performRenames(renames)
		}
	}
}



