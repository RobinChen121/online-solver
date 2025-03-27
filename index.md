---
layout: default
---

<p>
Please input the number of decision variables:
<input type="number" min = 10 id="numInput">
<button onclick="generateLatex()">Generate objective</button>
</p>

<h3>生成的公式:</h3>
<p id="latexOutput">$$\min\quad z = x_1 + x_2 + x_3$$</p>

<!-- 引入 MathJax -->
<script type="text/javascript" async
  id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<script>
function generateLatex() {
    let n = document.getElementById("numInput").value;
    n = Math.max(1, parseInt(n));

    
    let latexString = "$$" + "\\min\\quad z="  + Array.from({length: n}, (_, i) => `x_{${i+1}}+`).join(" ") + "$$";
    
    document.getElementById("latexOutput").innerHTML = latexString;
    
    console.log(latexString);

    
    document.getElementById("latexOutput").innerHTML = latexString;
    MathJax.typeset();
}
</script>
