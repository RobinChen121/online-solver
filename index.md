---
layout: home
---

<head>
    <meta charset="utf-8">

    <title>Welcome to use my solver</title>

    <!-- 引入 MathJax -->
    <script type="text/javascript" async
            id="MathJax-script"
            src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <script src="https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"></script>
</head>

<body>
<p>
    <label for="input_num">Number of decision variables: </label><input type="number"
                                                                        style="width: 5%;"
                                                                        id="input_num"
                                                                        value="2"
                                                                        min="2"
                                                                        max="20" required>
    <!--使用百分比来让输入框的宽度相对于其父容器的宽度进行调整。-->

    <label for="select_obj_sense" style="margin-left: 3%">Objective: </label>
    <select id="select_obj_sense">
        <option value=1 selected>Min</option>
        <option value=0>Max</option>
    </select>

    <button id="button_reset" onclick = "reset()" style="position: relative; left: 30%;">Reset</button>
</p>

<p>
    <button id="button_input_obj_coe" onclick="inputObjCoefficients()">Input objective
        coefficients
    </button>
    <!--<p id="ini_obj">$$x_1 + x_2$$</p>-->
    <!--<div> 是一个 HTML 元素，常用于分组和布局，不会直接显示任何内容，但可以用于包含其他 HTML 元素-->
<div id="objCoeContainer"></div>
</p>


<p>
    <button id="button_generate_obj" onclick="inputObj()" disabled>Generate objective
    </button>
</p>

<p>
    <button id="button_input_constr" onclick="inputConstraint()" disabled>Input coefficients for
        a
        constraint
    </button>
    <button id="button_add_constr" style="margin-left:3%" onclick="addConstraint()" disabled>Add
        the
        constraint in the model
    </button>
    <button id="button_remove_constr" style="margin-left:3%" onclick="removeConstraint()"
            disabled>
        Remove the
        constraint
    </button>
</p>
<p>
<div id='constr_input_container'></div>
</p>
<p>
    <button id="button_select_variable_type" onclick="selectVariableType()" disabled>Select
        Variable
        type
    </button>
</p>
<div id='var_type_container'></div>

<p>
    <button id="button_generate_full_model" style="margin-top: 1%" onclick="generateFullModel()"
            disabled>Generate full model
    </button>

    <button id="button_draw_picture" style="margin-top: 1%; margin-left:3%" onclick="draw_picture()"
            >Draw picture for 2D model
    </button>
</p>


<!-- <hr> 默认是一个边框式的水平线，需要使用 border 或 background 才能控制颜色和透明度。-->
<hr style="border: 1px solid rgba(0, 0, 0, 0.1);">
<p id="initial_model" style="margin-top: 1%">\[\begin{aligned}
    \max\quad &z = 2x_1 + 3x_2\\
    \text{s.t.}\quad&\\
    &2x_1 + x_2\leq 4\\
    &x_1 + 2x_2\leq 5\\
    &x_1\geq 0, x_2\geq 0.
    \end{aligned}\]</p>
<hr style="border: 1px solid rgba(0, 0, 0, 0.1);">
<div id="calculator" style="width: 650px; height: 650px;"></div>

</body>

<script>
    // store the model in numerical arrays
    let obj_coefficients = ['0', '0']; // 创建一个空数组
    let con_coefficients = [];
    let var_types = [];

    let num_constraint = 0;
    let obj_latex_str = '';
    let con_latex_str = [];
    let var_type_latex_str = '';
    let initial_model_latex = '\\[\\begin{aligned}\n' +
        '\\max\\quad &z = 2x_1 + 3x_2\\\\\n' +
        '\\text{s.t.}\\quad&\\\\\n' +
        '&2x_1 + x_2\\leq 4\\\\\n' +
        '&x_1 + 2x_2\\leq 5\\\\\n' +
        '&x_1\\geq 0, x_2\\geq 0.' +
        '\\end{aligned}\\]';

    elt = document.getElementById('calculator');
    const calculator = Desmos.GraphingCalculator(elt,{
        // expressionsCollapsed: true, // // 默认折叠表达式列表
    });
    elt.style.display = 'none';

    // 使用 disabled 属性来控制按钮的可用状态
    // 在一个按钮（button1）被点击后，使另一个按钮（button2）变为可用（启用）
    document.getElementById("button_input_obj_coe").addEventListener("click", function () {
        document.getElementById("button_generate_obj").disabled = false; // 使按钮可用
        document.getElementById("button_input_constr").disabled = false;
    });


    function getNumVar() {
        let n = parseInt(document.getElementById("input_num").value);
        return n;
    }

    function inputObjCoefficients() {
        let num_var = getNumVar();
        if (num_var != 2){
            document.getElementById("button_draw_picture").disabled = true;
        }
        else{
            document.getElementById("button_draw_picture").disabled = false;
        }
        obj_coefficients.length = num_var;  // 清空数组
        document.getElementById('initial_model').innerText = '';
        let coeContainer = document.getElementById("objCoeContainer");
        // 清空容器，确保每次点击按钮时重新生成输入框
        coeContainer.innerHTML = '';
        // 根据给定数目生成输入框
        for (let i = 0; i < num_var; i++) {
            // 创建新的 <input> 元素
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'number'; // 设置输入框类型为文本
            input.id = 'coe_obj' + i; // 设置输入框 ID（可选）
            input.style.width = '50px';
            input.style.marginLeft = '0.3%';
            label.style.marginLeft = '0.3%';
            input.value = '0'; // 默认值
            label.setAttribute('for', 'coe_obj' + i);
            // 设置 LaTeX 内容
            let latexString = '';
            if (i < num_var - 1) {
                latexString = `x_{${i + 1}}+ `;
            } else
                latexString = `x_{${i + 1}}`;
            label.innerHTML = `\\(${latexString}\\)`;

            // 将输入框添加到容器中
            coeContainer.appendChild(input);
            coeContainer.appendChild(label);
        }
        // 在所有元素都添加完后，调用 MathJax 渲染所有的 LaTeX 公式
        MathJax.typeset();

    }

    let selected_obj_sense = '';  // 用来存储用户选择的值
    selected_obj_sense = document.getElementById('selected_obj_sense').value;
    // document.getElementById("select_obj_sense").addEventListener("change", function () {
    //     selected_obj_sense = this.value;
    // });

    // 提供一个函数，用来返回用户选择的值
    function getSelectedSense() {
        return selected_obj_sense;  // 返回当前的选中值
    }

    function generateFormulaLatex(arr, n) {
        let latexBodyStr = '';
        // ${} 用于 模板字符串（Template Literals），允许在字符串中嵌入变量或表达式
        // 反引号 ``：用于 模板字符串，支持 ${} 变量插值
        for (let i = 0; i < n; i++) {
            if (parseFloat(arr[i]) >= 0 && i > 0) {
                latexBodyStr += '+';
            }
            if (parseFloat(arr[i]) != 1) {
                if (parseFloat(arr[i]) != -1) {
                    latexBodyStr += arr[i];
                } else {
                    latexBodyStr += '-';
                }
            }
            latexBodyStr += `x_{${i + 1}}`;
        }
        return latexBodyStr;
    }

    function inputObj() {
        // 让决策变量数量输入框实效
        document.getElementById("input_num").disabled = true;
        document.getElementById("select_obj_sense").disabled = true;

        let n = document.getElementById("input_num").value; // 获取 id 为 input_num 的标签中的 value 值
        n = Math.max(1, parseInt(n)); // parseInt() 是 JavaScript 用于将字符串转换为整数的内置函数

        // 得到输入框的系数
        for (let i = 0; i < n; i++) {
            let input_id = 'coe_obj' + i;
            let coe = document.getElementById(input_id).value;
            obj_coefficients[i] = coe;
        }

        let select_obj_sense = getSelectedSense();
        let objStr = '';
        objStr += generateFormulaLatex(obj_coefficients, n);
        obj_latex_str = objStr;
        renderLatexModel(objStr);
    }

    function renderLatexModel(obj_str, con_str = '', var_type_str = '') {
        let select_obj_sense = getSelectedSense();
        let obj_sense_str;
        // 因为在 HTML 中，select 的 value 是字符串类型，所以应该与字符串 "1" 进行比较，而不是数字 1
        if (select_obj_sense === "0") {
            obj_sense_str = "\\max";
        } else {
            obj_sense_str = "\\min";
        }

        let latexModel = '';
        if (con_str === '') {
            latexModel += `
            \\[
            ${obj_sense_str}\\quad z=${obj_str}
            \\]
            `;
        } else if (con_str === '') {
            let num_con = con_str.length;
            let con_body_str = '';
            for (let i = 0; i < num_con; i++) {
                con_body_str += '&' + con_str[i] + "\\\\";
            }
            latexModel += `
            \\[
            \\begin{aligned}
            ${obj_sense_str}\\quad &${obj_str}\\\\
            \\text{s.t.}\\quad&\\\\
            ${con_body_str}
            \\end{aligned}
            \\]
            `;
        } else {
            let num_con = con_str.length;
            let con_body_str = '';
            for (let i = 0; i < num_con; i++) {
                con_body_str += '&' + con_str[i] + '\\\\';
            }
            latexModel += `
            \\[
            \\begin{aligned}
            ${obj_sense_str}\\quad &${obj_str}\\\\
            \\text{s.t.}\\quad&\\\\
            ${con_body_str}
            &${var_type_str}
            \\end{aligned}
            \\]
            `;
        }

        document.getElementById("initial_model").innerHTML = latexModel;
        MathJax.typeset(); // typeset 适用于小型公式更新，局部重新渲染, typesetPromise适合大规模更新
    }

    function inputConstraint() {
        let num_var = getNumVar();
        document.getElementById("button_input_obj_coe").disabled = true;
        document.getElementById("button_generate_obj").disabled = true;

        let coeContainer = document.getElementById("constr_input_container");
        coeContainer.innerHTML = '';
        // 根据给定数目生成输入框
        for (let i = 0; i < num_var; i++) {
            // 创建新的 <input> 元素
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'number'; // 设置输入框类型为文本
            input.id = 'constraint_coe' + i; // 设置输入框 ID（可选）
            input.style.width = '50px';
            input.style.marginLeft = '0.3%';
            label.style.marginLeft = '0.3%';
            input.value = '0'; // 默认值
            label.setAttribute('for', 'constraint_coe' + i);
            // 设置 LaTeX 内容
            let latexString = '';
            if (i < num_var - 1) {
                latexString = `x_{${i + 1}}+ `;
            } else
                latexString = `x_{${i + 1}}`;
            label.innerHTML = `\\(${latexString}\\)`;

            // 将输入框添加到容器中
            coeContainer.appendChild(input);
            coeContainer.appendChild(label);
        }

        // 创建 select 元素
        const select = document.createElement("select");
        select.id = 'constraint_sense';

        select.style.marginLeft = '0.5%';

        // 创建多个 option 元素
        const option1 = document.createElement("option");
        option1.value = "\\geq";
        option1.textContent = "≥";
        option1.selected = true;


        const option2 = document.createElement("option");
        option2.value = "=";
        option2.textContent = "=";

        const option3 = document.createElement("option");
        option3.value = "\\leq";
        option3.textContent = "<=";

        // 将 option 元素添加到 select 元素中
        select.appendChild(option1);
        select.appendChild(option2);
        select.appendChild(option3);

        coeContainer.appendChild(select);

        const input_rhs = document.createElement('input');
        input_rhs.type = 'number'; // 设置输入框类型为文本
        input_rhs.id = 'constraint_rhs';
        input_rhs.style.width = '50px';
        input_rhs.style.marginLeft = '0.3%';
        input_rhs.value = 0;

        coeContainer.appendChild(input_rhs);

        // 在所有元素都添加完后，调用 MathJax 渲染所有的 LaTeX 公式
        MathJax.typeset();
        document.getElementById('button_add_constr').disabled = false;
    }


    function addConstraint() {
        let num_var = getNumVar();
        let this_coes = new Array(num_var + 2);
        document.getElementById("button_select_variable_type").disabled = false;

        for (let i = 0; i < num_var; i++) {
            let input_id = 'constraint_coe' + i;
            this_coes[i] = document.getElementById(input_id).value;
        }
        let sense_id = 'constraint_sense';
        this_coes[num_var] = document.getElementById(sense_id).value;
        let rhs_id = 'constraint_rhs';
        this_coes[num_var + 1] = document.getElementById(rhs_id).value;
        con_coefficients.push(this_coes.slice(0, num_var));
        constraint_str = generateFormulaLatex(this_coes.slice(0, num_var), num_var);
        constraint_str += this_coes[num_var];
        constraint_str += ' ' + this_coes[num_var + 1];
        con_latex_str.push(constraint_str);
        renderLatexModel(obj_latex_str, con_latex_str);
        document.getElementById('button_remove_constr').disabled = false;
        num_constraint += 1;
    }

    function removeConstraint() {
        if (num_constraint >= 1) {
            con_latex_str.pop();
            renderLatexModel(obj_latex_str, con_latex_str);
            num_constraint -= 1;
            if (num_constraint === 0) {
                document.getElementById('button_remove_constr').disabled = true;
            }
        }
    }

    function selectVariableType() {
        document.getElementById("button_input_constr").disabled = true;
        document.getElementById("button_add_constr").disabled = true;
        document.getElementById("button_remove_constr").disabled = true;

        document.getElementById('button_generate_full_model').disabled = false;
        let num_var = getNumVar();
        let type_container = document.getElementById("var_type_container");
        type_container.innerHTML = '';
        for (let i = 0; i < num_var; i++) {
            let label = document.createElement('label');
            let select = document.createElement('select');
            select.id = 'var_type' + (i + 1);
            select.style.marginLeft = '0.4%';
            select.style.marginRight = '0.2%';
            if (i > 0) {
                label.style.marginLeft = '0.8%';
            }
            label.innerText = `\\(x_{${i + 1}}\\):`;
            label.setAttribute('for', 'var_type' + (i + 1));

            // 创建多个 option 元素
            let option1 = document.createElement("option");
            option1.textContent = "≥ 0 continuous";
            option1.value = 0;
            option1.selected = true;
            let option2 = document.createElement("option");
            option2.value = 1;
            option2.textContent = "continuous";
            let option3 = document.createElement("option");
            option3.textContent = "binary";
            option3.value = 2;
            let option4 = document.createElement("option");
            option4.textContent = "integer";
            option4.value = 3;

            select.appendChild(option1);
            select.appendChild(option2);
            select.appendChild(option3);
            select.appendChild(option4);

            type_container.appendChild(label);
            type_container.appendChild(select);

        }

        MathJax.typeset();
    }

    function generateFullModel() {
        document.getElementById("button_input_constr").disabled = true;
        document.getElementById("button_add_constr").disabled = true;
        document.getElementById("button_remove_constr").disabled = true;
        document.getElementById("button_select_variable_type").disabled = true;

        num_var = getNumVar();
        var_type_latex_str = '';
        for (let i = 0; i < num_var; i++) {
            let select_id = 'var_type' + (i + 1);
            let select = document.getElementById(select_id);
            if (select.value === '0') {
                var_type_latex_str += `x_{${i + 1}}\\geq 0`;
            } else if (select.value === '2') {
                var_type_latex_str += `x_{${i + 1}}\\in \\{0,1\\}`;
            } else if (select.value === '3') {
                var_type_latex_str += `x_{${i + 1}}\\in \\mathbb\{Z\}`;
            }
            if (select.value != '1') {
                if (i < num_var - 1) {
                    var_type_latex_str += ',';
                } else {
                    var_type_latex_str += '.';
                }
            }
            if (i === num_var - 1 && select.value === '1') {
                let len = var_type_latex_str.length;
                let new_str = var_type_latex_str.slice(0, -2) + var_type_latex_str.slice(-1);
                var_type_latex_str = new_str;
            }
        }
        renderLatexModel(obj_latex_str, con_latex_str, var_type_latex_str);
    }

    function reset(){
        document.getElementById("input_num").disabled = false; // 让按钮恢复可点击
        document.getElementById("input_num").value = "2";
        document.getElementById("select_obj_sense").disabled = false;
        document.getElementById("button_input_obj_coe").disabled = false;
        document.getElementById("button_generate_obj").disabled = true;
        document.getElementById("button_input_constr").disabled = true;
        document.getElementById("button_add_constr").disabled = true;
        document.getElementById("button_remove_constr").disabled = true;
        document.getElementById("button_select_variable_type").disabled = true;
        document.getElementById("button_generate_full_model").disabled = true;
        con_latex_str = [];
        obj_latex_str = '';
        var_type_latex_str = '';
        document.getElementById("constr_input_container").innerHTML = '';
        document.getElementById("var_type_container").innerHTML = '';
        document.getElementById("objCoeContainer").innerHTML = '';

        elt.style.display = 'none';

        // innerHTML 会把 tag 也返回
        document.getElementById("initial_model").innerText = initial_model_latex;
        MathJax.typeset();
    }

    function draw_picture() {
        elt.style.display = 'block';

        // **添加约束边界线**
        calculator.setExpression({ id: 'line1', latex: '2x + y = 4', color: 'blue',});
        calculator.setExpression({ id: 'line2', latex: 'x + 2y = 5', color: 'green' });
        calculator.setExpression({ id: 'x_axis', latex: 'x = 0', color: 'black' });
        calculator.setExpression({ id: 'y_axis', latex: 'y = 0', color: 'black' });

        // **添加约束边界线**
        calculator.setExpression({ id: 'area1', latex: '2x + y \\leq 4', color: 'blue', hidden: true });
        calculator.setExpression({ id: 'area2', latex: 'x + 2y \\leq 5', color: 'green', hidden: true });
        calculator.setExpression({ id: 'area3', latex: 'x \\geq 0', color: 'black', hidden: true });
        calculator.setExpression({ id: 'area4', latex: 'y \\geq 0', color: 'black', hidden: true });

        // **填充可行域（仅交集部分）**
        calculator.setExpression({
            id: 'feasible_region',
            latex: '\\max(2x + y - 4, x + 2y - 5, -x, -y) \\leq 0',
            color: 'rgba(15,161,15,0.8)' // 绿色半透明
        });

        // **目标函数等值线**
        calculator.setExpression({
            id: 'objective',
            latex: '2x + 3y = c',
            lineStyle: Desmos.Styles.DASHED,
            color: 'red'
        });
    }
</script>
