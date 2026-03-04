const fs = require("fs");
const path = "C:/Programming/EventTicketingPlatform-master/EventTicketingPlatform-master/EventTicketingfrontend/src/app/venues/[id]/page.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(/<div className="min-h-screen" style={{[^}]+}}\s*>/s, `<div className="min-h-screen bg-[#0a0f1c] text-slate-200 selection:bg-purple-500/30 selection:text-purple-300 font-sans transition-colors duration-500 relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0f1c]/0 to-transparent pointer-events-none z-0"></div>
            <div className="fixed top-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a0f1c]/0 to-transparent pointer-events-none z-0"></div>

            <div className="relative z-10 w-full min-h-screen">`);

content = content.replace(/            \{\/\* Footer \*\/\}\r?\n            <div className={`\$\{themeClasses\.backgroundHeader\}/s, `            </div>\n            {/* Footer */}\n            <div className={\`\${themeClasses.backgroundHeader}`);

fs.writeFileSync(path, content, "utf8");
console.log("Done");
