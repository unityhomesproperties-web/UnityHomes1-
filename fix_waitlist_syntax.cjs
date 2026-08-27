const fs = require('fs');

let content = fs.readFileSync('/tmp/WaitlistPage.tsx.bak', 'utf8');

const s2 = content.indexOf('{currentStep === 2 && (');
const s3 = content.indexOf('{currentStep === 3 && (');
const s4 = content.indexOf('{currentStep === 4 && (');
const sEnd = content.indexOf('</AnimatePresence>', s4);

let form2 = content.substring(content.indexOf('<div className="space-y-6">', s2), s3);
let form3 = content.substring(content.indexOf('<div className="space-y-8">', s3), s4);
let form4 = content.substring(content.indexOf('<div className="space-y-6">', s4), sEnd);

// Strip trailing `)}` and `</div>`s that belong to the outer AnimatePresence structure if any,
// Actually, `form2` ends with `)}`. So let's trim whitespace and remove trailing `)}`.
function stripTrailing(str) {
    let s = str.trim();
    if (s.endsWith(')}')) {
        s = s.substring(0, s.length - 2).trim();
    }
    // There might be another `</div>` from `AnimatePresence` or step container? 
    // In original code:
    // {currentStep === 2 && ( <div ...> ... </div> )}
    // So the `</div>` matches the `<div className="space-y-6">`
    return s;
}

form2 = stripTrailing(form2);
form3 = stripTrailing(form3);
form4 = stripTrailing(form4);

// For form4, the end is before `</AnimatePresence>`, so there might be extra `</div> )} </div> </div>` at the end of form4.
// Let's just find the last `)}` and strip it.
function stripAllTrailing(str) {
    let s = str;
    while(true) {
        s = s.trim();
        if (s.endsWith(')}')) {
            s = s.substring(0, s.length - 2);
        } else if (s.endsWith('</div>') && !s.includes('<div')) {
            // Unsafe to just strip </div> blindly, let's just strip `)}` and let React complain if unbalanced
            break;
        } else {
            break;
        }
    }
    return s;
}

// Better approach: extract the inner HTML of the step divs.
// Step 2 starts with `<div className="space-y-6">`. We can just find its matching closing div.
function getInnerBlock(str, startStr) {
    let startIdx = str.indexOf(startStr);
    let open = 0;
    let endIdx = -1;
    // We will just do a simple tag counter
    let i = startIdx;
    while(i < str.length) {
        if (str.substring(i, i+4) === '<div') { open++; i += 4; }
        else if (str.substring(i, i+5) === '</div') {
            open--;
            i += 5;
            if (open === 0) {
                endIdx = i + 1; // including >
                break;
            }
        }
        else { i++; }
    }
    return str.substring(startIdx, endIdx);
}

form2 = getInnerBlock(content.substring(s2), '<div className="space-y-6">');
form3 = getInnerBlock(content.substring(s3), '<div className="space-y-8">');
// Step 4 starts with `<div className="space-y-6">` inside `{currentStep === 4 && (`
form4 = getInnerBlock(content.substring(s4), '<div className="space-y-6">');

const formAreaContent = `
          {currentStep === 2 && (
            <div className="animate-fade-in w-full">
              ${form2}
            </div>
          )}
          {currentStep === 3 && (
            <div className="animate-fade-in w-full">
              ${form3}
            </div>
          )}
          {currentStep === 4 && (
            <div className="animate-fade-in w-full">
              ${form4}
              
              {submitError && (
                <div className="p-5 bg-[#FDEDED] border border-[#F5C2C7] rounded-[18px] text-[#842029] font-medium text-sm mt-6">
                  {submitError}
                </div>
              )}
            </div>
          )}
`;

let currentFile = fs.readFileSync('src/pages/WaitlistPage.tsx', 'utf8');
// We need to replace the formAreaContent in currentFile.
// The easiest way is to use a regex or string replacement on the previously injected block.
// Since we generated the file before, let's find `animate-fade-in w-full` and replace the whole thing.
const startReplace = currentFile.indexOf('{currentStep === 2 && (');
const endReplace = currentFile.indexOf('</motion.div>', startReplace);
if (startReplace > -1 && endReplace > -1) {
    // wait, endReplace should be the closing of `form-content w-full` div which is just before `border-t border-gray-100`
    const borderT = currentFile.indexOf('<div className="mt-10 pt-6 border-t border-gray-100', startReplace);
    currentFile = currentFile.substring(0, startReplace) + formAreaContent + currentFile.substring(borderT);
    fs.writeFileSync('src/pages/WaitlistPage.tsx', currentFile);
    console.log("Syntax fixed");
} else {
    console.log("Could not find block to replace");
}
