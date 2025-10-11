/**
 * @typedef {Object} MathJax
 * @property {function(Array<string|Element>=):void} typeset
 * @property {function(Array<string|Element>=):Promise<void>} typesetPromise
 * @property {function(Array<string|Element>=):void} typesetClear
 */

    // globe variables
let obj_sense = 1; // 0 表示 min，1 表示 max
let obj_coe = [2, 3];
let con_lhs = [[2, 1], [1, 2]];
let con_rhs = [4, 5];
let con_sense = [0, 0]; // 0 表示 <=, 1 表示 >=, 2 表示 =
let var_sign = [0, 0]; // 0 表示非负连续，1 表示非正连续，2 表示连续，3 表示 0-1 变量，4 表示整数变量
let stand_obj_coe = obj_coe.slice(); // 深拷贝
let stand_con_lhs = con_lhs.map(row => row.slice());

let num_constraint = con_lhs.length;
let num_var = obj_coe.length;

let con_var_slack = [];
let con_var_artificial = [];
let standardized = false;

let solution_status = 3; // 3 unsolved
let opt_value;
let solution = [];

let initial_model_latex =
    "\\[\\begin{aligned}\n" +
    "\\max\\quad &z = 2x_1 + 3x_2\\\\\n" +
    "\\text{s.t.}\\quad&\\\\\n" +
    "&2x_1 + x_2\\leq 4\\\\\n" +
    "&x_1 + 2x_2\\leq 5\\\\\n" +
    "&x_1\\geq 0, x_2\\geq 0." +
    "\\end{aligned}\\]";

/** @type {HTMLElement} */
elt = document.getElementById("calculator");
const calculator = Desmos.GraphingCalculator(elt, {
    // expressionsCollapsed: true, // // 默认折叠表达式列表
});
elt.style.display = "none";

// 使用 disabled 属性来控制按钮的可用状态
// 在一个按钮（button1）被点击后，使另一个按钮（button2）变为可用（启用）
document
    .getElementById("button_input_obj_coe")
    .addEventListener("click", function () {
        document.getElementById("button_generate_obj").disabled = false; // 使按钮可用
        document.getElementById("button_input_constr").disabled = false;
    });


function solve() {
    simplexModule().then(Module => {
        function arrayToVectorInt(arr) {
            let v = new Module.VectorInt();
            arr.forEach(x => v.push_back(x));
            return v;
        }

        function arrayToVectorDouble(arr) {
            let v = new Module.VectorDouble();
            arr.forEach(x => v.push_back(x));
            return v;
        }

        function vectorDoubleToArray(v) {
            const arr = [];
            const n = v.size();
            for (let i = 0; i < n; i++) {
                arr.push(v.get(i));
            }
            return arr;
        }

        function array2DToVectorVectorDouble(arr2d) {
            let vv = new Module.VectorVectorDouble();
            arr2d.forEach(row => vv.push_back(arrayToVectorDouble(row)));
            return vv;
        }

        const s = new Module.Simplex(obj_sense,
            arrayToVectorDouble(obj_coe),
            array2DToVectorVectorDouble(con_lhs),
            arrayToVectorDouble(con_rhs),
            arrayToVectorInt(con_sense),
            arrayToVectorInt(var_sign));
        console.log("Simplex instance created successfully:", s);
        s.standardize();
        s.solve();
        solution_status = s.getStatus();
        if (solution_status === 0)
            opt_value = s.getOptValue();
        let simplex_solution = s.getOptSolution();
        solution = vectorDoubleToArray(simplex_solution);
        let element = document.getElementById("show_solution");
        if (solution_status === 0) {
            let text = "";
            text += "The optimal value is:  " + opt_value.toString() + "\n"
            text += "The optimal solution is: \n"
            // 最优解向量公式
            text += `\\(`;
            for (let i = 0; i < solution.length; i++) {
                text += `x_{${i + 1}} = ${solution[i]}`;
                if (i !== solution.length - 1) text += ", ";
            }
            text += `\\)`;
            element.innerText = text;
        } else if (solution_status === 1) {
            element.innerText = "The problem is unbounded";
        } else if (solution_status === 2) {
            element.innerText = "The problem is infeasible";
        }
        MathJax.typeset();
        // 显示整个容器
        document.getElementById("container_solution").style.display = "block";
        console.log();
    });
}

function getNumVar() {
    /** @type {HTMLInputElement} */
    const elt = document.getElementById("input_var_num");
    return parseInt(elt.value);
}

function inputObjCoefficients() {
    elt.style.display = "none";
    // Remove all expressions
    let arrs = calculator.getExpressions();
    for (let arr of arrs) {
        let id_str = arr.id;
        calculator.removeExpression({id: id_str});
    }

    document.getElementById("button_draw_picture").disabled = true;
    document.getElementById("button_solve").disabled = true;
    document.getElementById("button_standardize_model").disabled = true;
    document.getElementById("container_solution").style.display = "none"
    document.getElementById("container_stand_model").style.display = "none"

    num_var = getNumVar();
    obj_coe.length = num_var; // js 数组的 length 可以动态变化
    con_lhs.length = 0;
    con_sense.length = 0;
    con_rhs.length = 0;
    var_sign.length = num_var;

    document.getElementById("model_latex").innerText = "";
    let coeContainer = document.getElementById("obj_coe_container");
    // 清空容器，确保每次点击按钮时重新生成输入框
    coeContainer.innerHTML = "";
    // 创建一个 <p> 标签
    let p1 = document.createElement("p");
    p1.style.marginLeft = "10%";
    p1.style.marginRight = "5%";
    p1.style.display = "inline-block"; // 让它和 input 同行

    obj_sense = document.getElementById("select_obj_sense").value;
    if (obj_sense === '0')
        p1.innerText = "\\(\\min\\)";
    else
        p1.innerText = "\\(\\max\\)";
    coeContainer.appendChild(p1);

    // 根据给定数目生成输入框

    for (let i = 0; i < num_var; i++) {
        // 创建新的 <input> 元素
        /** @type {HTMLElement} */
        const label = document.createElement("label");
        /** @type {HTMLElement} */
        const input = document.createElement("input");
        input.type = "number"; // 设置输入框类型为文本
        input.id = "obj_coe" + i; // 设置输入框 ID（可选）
        input.style.marginLeft = "0.5%";
        label.style.marginLeft = "0.5%";
        input.value = "0"; // 默认值
        label.setAttribute("for", "obj_coe" + i);
        // 设置 LaTeX 内容
        let latexString = "";
        if (i < num_var - 1) {
            latexString = `x_{${i + 1}}+~`;
        } else latexString = `x_{${i + 1}}`;
        label.innerHTML = `\\(${latexString}\\)`;

        // 将输入框添加到容器中
        coeContainer.appendChild(input);
        coeContainer.appendChild(label);
    }
    let p2 = document.createElement("p");
    p2.style.marginLeft = "10%";
    p2.innerText = "\\(\\text{s.t.}\\)";
    p2.style.marginBottom = "0";
    coeContainer.appendChild(p2);

    for (let j = 0; j < num_constraint; j++) {
        for (let i = 0; i < num_var; i++) {
            // 创建新的 <input> 元素
            /** @type {HTMLElement} */
            const label = document.createElement("label");
            /** @type {HTMLElement} */
            const input = document.createElement("input");
            input.type = "number"; // 设置输入框类型为文本
            input.id = "con_coe" + j.toString() + '_' + i; // 设置输入框 ID（可选）
            if (i === 0)
                input.style.marginLeft = "13%";
            label.style.marginLeft = "0.5%";
            input.value = "0"; // 默认值
            label.setAttribute("for", "con_coe" + i);
            // 设置 LaTeX 内容
            let latexString = "";
            if (i < num_var - 1) {
                latexString = `x_{${i + 1}}+~`;
            } else latexString = `x_{${i + 1}}`;
            label.innerHTML = `\\(${latexString}\\)`;

            // 将输入框添加到容器中
            coeContainer.appendChild(input);
            coeContainer.appendChild(label);

            if (i === num_var - 1) {
                const select = document.createElement("select");
                select.style.fontSize = "20px";
                select.id = "constraint_sense" + j.toString();
                // 创建多个 option 元素
                const option1 = document.createElement("option");
                option1.value = 0;
                option1.textContent = "≤";
                option1.selected = true;
                const option2 = document.createElement("option");
                option2.value = 1;
                option2.textContent = "≥";
                const option3 = document.createElement("option");
                option3.value = 2;
                option3.textContent = "=";
                // 将 option 元素添加到 select 元素中
                select.appendChild(option1);
                select.appendChild(option2);
                select.appendChild(option3);

                coeContainer.appendChild(select);

                const input = document.createElement("input");
                input.type = "number"; // 设置输入框类型为文本
                input.id = "con_coe" + j.toString() + '_' + i; // 设置输入框 ID（可选）
                coeContainer.appendChild(input);
            }
        }
        coeContainer.appendChild(document.createElement('br')); // 强制换行
    }

    // 在所有元素都添加完后，调用 MathJax 渲染所有的 LaTeX 公式
    /* global MathJax */
    MathJax.typeset();
}

document
    .getElementById("select_obj_sense")
    .addEventListener("change", function () {
        obj_sense = Number(this.value);
    });


function showAlert() {
    /** @type {HTMLElement} */
    let element = document.getElementById("overlay");
    element.style.display = 'block';
    /** @type {HTMLElement} */
    element = document.getElementById("my_alert");
    element.style.display = 'flex';
}

function closeAlert() {
    /** @type {HTMLElement} */
    let element = document.getElementById("overlay");
    element.style.display = 'none';
    /** @type {HTMLElement} */
    element = document.getElementById("my_alert");
    element.style.display = 'none';
}

function standardizeModel() {
    let element = document.getElementById("stand_latex");
    element.innerHTML = "";

    var_sign.length = num_var;
    for (let i = 0; i < num_var; i++) {
        let select_id = "select_var_type" + (i + 1);
        /**@type {HTMLElement} */
        let select = document.getElementById(select_id);
        if (select !== null) {
            const {value} = select;
            var_sign[i] = Number(value);
        }
    }

    if (obj_sense !== 0) {
        obj_coe = obj_coe.map(num => -num);
        obj_sense = 0;
    }
    for (let i = 0; i < num_constraint; i++) {
        if (con_rhs[i] < 0) {
            con_rhs[i] = -con_rhs[i];
            con_lhs[i] = con_lhs[i].map(num => -num);
            if (con_sense[i] === 0) // 0 表示 <=, 1 表示 >=, 2 表示 =
                con_sense[i] = 1;
            else if (con_sense[i] === 1)
                con_sense[i] = 0;
        }
        if (!standardized) {
            if (con_sense[i] === 0) {
                con_var_slack.push(1);
                con_var_artificial.push(0);
            } else if (con_sense[i] === 1) {
                con_var_slack.push(-1);
                con_var_artificial.push(1);
            } else {
                con_var_slack.push(0);
                con_var_artificial.push(1);
            }
        }
    }

    stand_obj_coe = obj_coe.slice(); // 深拷贝
    stand_con_lhs = con_lhs.map(row => row.slice()); // 深拷贝二维数组

    const n = var_sign.length;
    for (let i = 0; i < n; i++) {
        if (var_sign[i] === 3 || var_sign[i] === 4) {
            showAlert();
            return;
        }
    }
    let for_stand = true;

    for (let i = 0; i < n; i++) {
        if (var_sign[i] === 2) { // unsigned
            stand_obj_coe.splice(i + 1, 0, -obj_coe[i])
            for (let j = 0; j < num_constraint; j++) {
                let value = -con_lhs[j][i];
                stand_con_lhs[j].splice(i + 1, 0, value);
            }
        } else if (var_sign[i] === 5) { // <= continuous
            stand_obj_coe[i] = -stand_obj_coe[i];
            for (let j = 0; j < num_constraint; j++) {
                stand_con_lhs[j][i] = -stand_con_lhs[j][i];
                con_lhs[j][i] = -con_lhs[j][i];
            }
        }
    }
    for (let i = 0; i < con_var_slack.length; i++) {
        if (con_var_slack[i] !== 0) {
            stand_obj_coe.push(0);
            for (let j = 0; j < num_constraint; j++) {
                if (j === i)
                    stand_con_lhs[j].push(con_var_slack[i]);
                else
                    stand_con_lhs[j].push(0);
            }
        }
    }
    for (let i = 0; i < con_var_artificial.length; i++) {
        if (con_var_artificial[i] !== 0) {
            stand_obj_coe.push(0);
            for (let j = 0; j < num_constraint; j++) {
                if (j === i)
                    stand_con_lhs[j].push(con_var_artificial[i]);
                else
                    stand_con_lhs[j].push(0);
            }
        }
    }

    renderLatexModel(obj_sense, obj_coe, con_lhs, con_sense, con_rhs, var_sign, for_stand);
    standardized = true;
    // console.log(stand_obj_coe);
    // console.log("test");
    // console.table(stand_con_lhs);
}

function inputObj() {
    // 让决策变量数量输入框实效
    document.getElementById("input_var_num").disabled = true;
    document.getElementById("select_obj_sense").disabled = true;
    num_constraint = 0;
    let {value: n} = document.getElementById("input_var_num"); // 获取 id 为 input_var_num 的标签中的 value 值
    n = Math.max(1, parseInt(n)); // parseInt() 是 JavaScript 用于将字符串转换为整数的内置函数

    // 得到输入框的系数
    for (let i = 0; i < n; i++) {
        let input_id = "obj_coe" + i;
        /**@type {HTMLInputElement} */
        let input = document.getElementById(input_id);
        obj_coe[i] = Number(input.value);
    }
    let {value: sense} = document.getElementById("select_obj_sense");
    obj_sense = Number(sense);

    renderLatexModel(obj_sense, obj_coe);
}

/**
 *
 * @param arr{number[]}
 * @param for_stand
 * @param for_obj
 * @param constraint_index
 * @returns {string}
 */
function formulaToLatex(arr, for_stand = false, for_obj = false, constraint_index = 0) {
    let latex_str = "";
    let n = arr.length;
    for (let i = 0; i < n; i++) {
        if (arr[i] >= 0 && i > 0) {
            latex_str += "+";
        }
        // != 宽松不等，!== 严格不等，还要求类型不一样
        if (arr[i] !== 1) {
            if (arr[i] !== -1) {
                latex_str += String(arr[i]);
            } else {
                latex_str += "-";
            }
        }
        // ${} 用于 模板字符串（Template Literals），允许在字符串中嵌入变量或表达式
        // 反引号 ``：用于 模板字符串，支持 ${} 变量和表达式
        if (var_sign[i] === 2) {
            if (for_stand) {
                if (arr[i] === 1) {
                    latex_str += `x^+_{${i + 1}}-x^-_{${i + 1}}`;
                } else if (arr[i] === -1) {
                    latex_str += `x^+_{${i + 1}}+x^-_{${i + 1}}`;
                } else if (arr[i] < 0) {
                    latex_str += `x^+_{${i + 1}}+${-arr[i]}x^-_{${i + 1}}`;
                } else
                    latex_str += `x^+_{${i + 1}}-${arr[i]}x^-_{${i + 1}}`;
            } else
                latex_str += `x_{${i + 1}}`;
        } else
            latex_str += `x_{${i + 1}}`;

    }
    let s_count = 0;
    let a_count = 0;
    if (for_stand && for_obj) {
        for (let j = 0; j < num_constraint; j++) {
            if (con_var_slack[j] !== 0) {
                latex_str += `+0s_{${s_count + 1}}`;
                s_count++;
            }
            if (con_var_artificial[j] !== 0) {
                latex_str += `+0a_{${a_count + 1}}`;
                a_count++;
            }
        }
    }
    if (for_stand && !for_obj) {
        if (con_var_slack[constraint_index] === 1) {
            let count = con_var_slack.slice(0, constraint_index + 1).filter(x => x !== 0).length;
            latex_str += `+s_{${count}}`;
        } else if (con_var_slack[constraint_index] === -1) {
            let count = con_var_slack.slice(0, constraint_index + 1).filter(x => x !== 0).length;
            latex_str += `-s_{${count}}`;
        }
        if (con_var_artificial[constraint_index] === 1) {
            let count = con_var_artificial.slice(0, constraint_index + 1).filter(x => x !== 0).length;
            latex_str += `+a_{${count}}`;
        } else if (con_var_artificial[constraint_index] === -1) {
            let count = con_var_artificial.slice(0, constraint_index + 1).filter(x => x !== 0).length;
            latex_str += `-a_{${count}}`;
        }
    }

    return latex_str;
}

/**
 * transform one constraint to latex text
 * @param arr{number[]}: left hand side coefficients of the constraint
 * @param sense{number}
 * @param rhs{number}
 * @param for_stand
 * @param constraint_index
 * @returns {string}
 */
function constraintToLatex(arr, sense, rhs, for_stand = false, constraint_index = 0) {
    let latex_str = formulaToLatex(arr, for_stand, false, constraint_index);
    let sense_str = sense === 0 ? "\\leq" : sense === 1 ? "\\geq" : "=";
    if (for_stand)
        sense_str = "=";
    return latex_str + sense_str + String(rhs);
}

/**
 *
 * @param for_stand{boolean}
 * @returns {string}
 */
function varTypeToLatex(for_stand = false) {
    let n = var_sign.length;
    let var_type_latex = "";
    for (let i = 0; i < n; i++) {
        let value = var_sign[i];
        if (value === 0) {
            var_type_latex += `x_{${i + 1}}\\geq 0,`;
        } else if (value === 3) {
            var_type_latex += `x_{${i + 1}}\\in \\{0,1\\},`;
        } else if (value === 4) {
            var_type_latex += `x_{${i + 1}}\\in \\mathbb\\{Z\\},`;
        } else if (value === 5) {
            var_type_latex += `x_{${i + 1}}\\leq 0,`;
        }
        // if (value !== 1) {
        //     if (i < n - 1) {
        //         var_type_latex += ",";
        //     } else {
        //         var_type_latex += ".";
        //     }
        // }
        if (for_stand) {
            if (value === 2)
                var_type_latex += `x^+_{${i + 1}}\\geq 0, x^-_{${i + 1}}\\geq 0,`;
            // if (i === n - 1) {
            //     var_type_latex += '.';
            // } else
            //     var_type_latex += ',';
        }
    }
    if (for_stand) {
        let slack_count = 0;
        let artificial_count = 0;
        for (let j = 0; j < num_constraint; j++) {
            if (con_var_slack[j] !== 0) {
                var_type_latex += `s_{${slack_count + 1}}\\geq 0,`;
                slack_count++;
            }
            if (con_var_artificial[j] !== 0) {
                var_type_latex += `a_{${artificial_count + 1}}\\geq 0,`;
                artificial_count++;
            }
        }
    }
    var_type_latex = var_type_latex.slice(0, -1) + ".";
    return var_type_latex;
}

/**
 *
 * @param obj_sense{number}
 * @param obj_coe{number[]}
 * @param con_lhs{number[][]}
 * @param con_sense{number[]}
 * @param con_rhs{number[]}
 * @param var_sign{number[]}
 * @param for_stand{boolean}
 */
function renderLatexModel(obj_sense, obj_coe, con_lhs = [], con_sense = [], con_rhs = [], var_sign = [], for_stand = false) {
    let latexModel = "";
    let obj_sense_str = obj_sense === 1 ? "\\max" : "\\min";
    let for_obj = for_stand === true;
    let obj_str = formulaToLatex(obj_coe, for_stand, for_obj);
    if (con_lhs.every(row => row.length === 0)) {
        // 反单引号可以创建模板字符串，即字符串里包含变量或表达式
        latexModel += `
            \\[
            ${obj_sense_str}\\quad z=${obj_str}
            \\]
            `;
    } else if (var_sign.length === 0) {
        let con_body_str = "";
        for (let i = 0; i < con_lhs.length; i++) {
            con_body_str += "&" + constraintToLatex(con_lhs[i], con_sense[i], con_rhs[i], for_stand, i) + "\\\\";
        }
        latexModel += `
            \\[
            \\begin{aligned}
            ${obj_sense_str}\\quad &z=${obj_str}\\\\
            \\text{s.t.}\\quad&\\\\
            ${con_body_str}
            \\end{aligned}
            \\]
            `;
    } else {
        let var_type_str = varTypeToLatex(for_stand);
        let con_body_str = "";
        for (let i = 0; i < num_constraint; i++) {
            con_body_str += "&" + constraintToLatex(con_lhs[i], con_sense[i], con_rhs[i], for_stand, i) + "\\\\";
        }
        latexModel += `
            \\[
            \\begin{aligned}
            ${obj_sense_str}\\quad &z=${obj_str}\\\\
            \\text{s.t.}\\quad&\\\\
            ${con_body_str}
            &${var_type_str}
            \\end{aligned}
            \\]
            `;
    }

    if (!for_stand) {
        document.getElementById("model_latex").innerHTML = latexModel;
    } else {
        /**@type {HTMLInputElement} */
        let element = document.getElementById("container_stand_model");
        element.style.display = "block";
        document.getElementById("stand_latex").innerHTML = latexModel;
    }
    MathJax.typeset(); // typeset 适用于小型公式更新，局部重新渲染, typesetPromise适合大规模更新
}


function inputConstraint() {
    num_var = getNumVar();
    document.getElementById("button_input_obj_coe").disabled = true;
    // document.getElementById("button_generate_obj").disabled = true;

    let coeContainer = document.getElementById("constr_input_container");
    coeContainer.innerHTML = "";
    // 根据给定数目生成输入框
    for (let i = 0; i < num_var; i++) {
        // const 声明的变量固定不变，而 let 声明的可以改变
        // 创建新的 <input> 元素
        /**@type {HTMLElement} */
        const label = document.createElement("label");
        /**@type {HTMLElement} */
        const input = document.createElement("input");
        input.type = "number"; // 设置输入框类型为文本
        input.id = "constraint_coe" + i; // 设置输入框 ID（可选）
        input.style.marginLeft = "0.3%";
        label.style.marginLeft = "0.3%";
        input.value = "0"; // 默认值
        label.setAttribute("for", "constraint_coe" + i);
        // 设置 LaTeX 内容
        let latexString = "";
        if (i < num_var - 1) {
            latexString = `x_{${i + 1}}+ `;
        } else latexString = `x_{${i + 1}}`;
        label.innerHTML = `\\(${latexString}\\)`;

        // 将输入框添加到容器中
        coeContainer.appendChild(input);
        coeContainer.appendChild(label);
    }

    // 创建 select 元素
    /**@type {HTMLElement} */
    const select = document.createElement("select");
    select.style.fontSize = "20px";
    select.id = "constraint_sense";

    // 创建多个 option 元素
    const option1 = document.createElement("option");
    option1.value = 0;
    option1.textContent = "≤";
    option1.selected = true;

    const option2 = document.createElement("option");
    option2.value = 1;
    option2.textContent = "≥";

    const option3 = document.createElement("option");
    option3.value = 2;
    option3.textContent = "=";

    // 将 option 元素添加到 select 元素中
    select.appendChild(option1);
    select.appendChild(option2);
    select.appendChild(option3);

    coeContainer.appendChild(select);

    /**@type {HTMLElement} */
    const input_rhs = document.createElement("input");
    input_rhs.type = "number"; // 设置输入框类型为文本
    input_rhs.id = "constraint_rhs";
    input_rhs.style.width = "50px";
    input_rhs.style.marginLeft = "0.3%";
    input_rhs.value = 0;

    coeContainer.appendChild(input_rhs);

    // 在所有元素都添加完后，调用 MathJax 渲染所有的 LaTeX 公式
    MathJax.typeset();
    document.getElementById("button_add_constr").disabled = false;
}

function addConstraint() {
    num_var = getNumVar();
    let this_lhs = new Array(num_var).fill(0);
    document.getElementById("button_select_variable_type").disabled = false;

    for (let i = 0; i < num_var; i++) {
        let input_id = "constraint_coe" + i;
        /**@type {HTMLInputElement} */
        let input = document.getElementById(input_id);
        this_lhs[i] = Number(input.value);
    }
    let sense_id = "constraint_sense";
    let {value: this_sense} = document.getElementById(sense_id);
    let rhs_id = "constraint_rhs";
    let {value: this_rhs} = document.getElementById(rhs_id);
    con_lhs.push(this_lhs);
    con_sense.push(Number(this_sense));
    con_rhs.push(Number(this_rhs));

    renderLatexModel(obj_sense, obj_coe, con_lhs, con_sense, con_rhs);
    document.getElementById("button_remove_constr").disabled = false;
    num_constraint += 1;
}

function removeConstraint() {
    if (num_constraint >= 1) {
        // con_latex_str.pop();
        con_rhs.pop();
        con_lhs.pop();
        con_sense.pop();
        renderLatexModel(obj_sense, obj_coe, con_lhs, con_sense, con_rhs);
        num_constraint -= 1;
        if (num_constraint === 0) {
            document.getElementById("button_remove_constr").disabled = true;
        }
    }
}

function selectVariableType() {
    document.getElementById("button_input_constr").disabled = true;

    document.getElementById("button_generate_full_model").disabled = false;
    document.getElementById("button_solve").disabled = false;
    let type_container = document.getElementById("var_type_container");
    type_container.innerHTML = "";
    for (let i = 0; i < num_var; i++) {
        /**@type {HTMLElement} */
        let label = document.createElement("label");
        /**@type {HTMLElement} */
        let select = document.createElement("select");
        select.id = "select_var_type" + (i + 1);
        select.style.marginLeft = "0.4%";
        select.style.marginRight = "0.2%";
        if (i > 0) {
            label.style.marginLeft = "0.8%";
        }
        label.innerText = `\\(x_{${i + 1}}\\):`;
        label.setAttribute("for", "var_sign" + (i + 1));

        // 创建多个 option 元素
        let option1 = document.createElement("option");
        option1.textContent = "≥ 0 continuous";
        option1.value = "0";
        option1.selected = true;
        let option2 = document.createElement("option");
        option2.value = "2";
        option2.textContent = "continuous";
        let option3 = document.createElement("option");
        option3.textContent = "binary";
        option3.value = "3";
        let option4 = document.createElement("option");
        option4.textContent = "integer";
        option4.value = "4";
        let option5 = document.createElement("option");
        option5.textContent = "≤ 0 continuous";
        option5.value = "5";

        select.appendChild(option1);
        select.appendChild(option2);
        select.appendChild(option3);
        select.appendChild(option4);
        select.appendChild(option5);

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
    document.getElementById("button_standardize_model").disabled = false;
    let num_var = getNumVar();
    if (num_var === 2) {
        document.getElementById("button_draw_picture").disabled = false;
    }

    var_sign.length = num_var;
    for (let i = 0; i < num_var; i++) {
        let select_id = "select_var_type" + (i + 1);
        /**@type {HTMLElement} */
        let select = document.getElementById(select_id);
        const {value} = select;
        var_sign[i] = Number(value);
        select.disabled = true;
    }
    renderLatexModel(obj_sense, obj_coe, con_lhs, con_sense, con_rhs, var_sign);
}

function reset() {
    document.getElementById("input_var_num").disabled = false; // 让按钮恢复可点击
    document.getElementById("input_var_num").value = "2";
    document.getElementById("select_obj_sense").disabled = false;
    document.getElementById("button_input_obj_coe").disabled = false;
    document.getElementById("button_draw_picture").disabled = false;
    document.getElementById("button_solve").disabled = false;
    document.getElementById("button_generate_obj").disabled = true;
    document.getElementById("button_input_constr").disabled = true;
    document.getElementById("button_add_constr").disabled = true;
    document.getElementById("button_remove_constr").disabled = true;
    document.getElementById("button_select_variable_type").disabled = true;
    document.getElementById("button_generate_full_model").disabled = true;
    document.getElementById("button_standardize_model").disabled = false;
    document.getElementById("container_stand_model")["style"].display = "none";
    document.getElementById("container_solution")["style"].display = "none";

    // con_latex_str = [];
    // obj_latex_str = "";
    // var_type_latex_str = "";
    document.getElementById("constr_input_container").innerHTML = "";
    document.getElementById("var_type_container").innerHTML = "";
    document.getElementById("obj_coe_container").innerHTML = "";
    /**@type {HTMLInputElement} */
    let element = document.getElementById("picture_border_line");
    element.style.display = "none";
    document.getElementById("container_solution").style.display = "none";

    obj_coe = [2, 3];
    obj_sense = 1;
    con_lhs = [
        [2, 1],
        [1, 2],
    ];
    con_sense = [0, 0];
    con_rhs = [4, 5];
    var_sign = [0, 0];
    num_constraint = 2;
    num_var = 2;
    stand_obj_coe = obj_coe.slice(); // 深拷贝
    stand_con_lhs = con_lhs.map(row => row.slice());
    con_var_slack = [];
    con_var_artificial = [];
    standardized = false;

    elt.style.display = "none";
    // Remove all expressions
    let arrs = calculator.getExpressions();
    for (let arr of arrs) {
        let id_str = arr.id;
        calculator.removeExpression({id: id_str});
    }

    // innerHTML 会把 tag 也返回
    document.getElementById("model_latex").innerText = initial_model_latex;
    MathJax.typeset();
}

function drawPicture() {
    MathJax.typeset();
    elt.style.display = "block";
    /**@type {HTMLInputElement} */
    let element = document.getElementById("picture_border_line");
    element.style.display = "block";

    // 添加约束边界线
    for (let i = 0; i < num_constraint; i++) {
        let latex_str_left = "";
        let var_str = "x";
        for (let j = 0; j < num_var; j++) {
            if (j === 1) {
                var_str = "y";
            }
            latex_str_left += String(con_lhs[i][j]) + var_str;
            if (j === 0 && con_lhs[i][j + 1] >= 0) {
                latex_str_left += "+";
            }
        }

        let latex_str_right = String(con_rhs[i]);
        let latex_line = latex_str_left + "=" + latex_str_right;
        calculator.setExpression({latex: latex_line}); // 约束条件的等式
        let latex_str_sense = con_sense[i] === 0 ? "\\leq" : con_sense[i] === 1 ? "\\geq" : "=";

        let latex_ueq = latex_str_left + latex_str_sense + latex_str_right;
        // id_str = 'area' + String(i + 1);
        calculator.setExpression({latex: latex_ueq, hidden: true});
    }

    // 可行域：约束条件
    let latex_feasible = "\\max("; // 默认里面都是小于等于0的不等式
    for (let i = 0; i < num_constraint; i++) {
        switch (con_sense[i]) {
            case 0:
                latex_feasible += String(con_lhs[i][0]) + "x";
                if (con_lhs[i][1] >= 0) {
                    latex_feasible += "+";
                }
                latex_feasible += String(con_lhs[i][1]) + "y";
                if (-con_rhs[i] >= 0) {
                    latex_feasible += "+";
                }
                latex_feasible += String(-con_rhs[i]) + ",";
                break;
            case 1:
                latex_feasible += String(-con_lhs[i][0]) + "x";
                if (-con_lhs[i][1] >= 0) {
                    latex_feasible += "+";
                }
                latex_feasible += String(-con_lhs[i][1]) + "y";
                if (con_rhs[i] >= 0) {
                    latex_feasible += "+";
                }
                latex_feasible += String(con_rhs[i]) + ",";
                break;
            default: // 相等时两个不等式
                latex_feasible += String(con_lhs[i][0]) + "x";
                if (con_lhs[i][1] >= 0) {
                    latex_feasible += "+";
                }
                latex_feasible += String(con_lhs[i][1]) + "y";
                if (-con_rhs[i] >= 0) {
                    latex_feasible += "+";
                }
                latex_feasible += String(-con_rhs[i]) + ",";

                latex_feasible += String(-con_lhs[i][0]) + "x";
                if (-con_lhs[i][1] >= 0) {
                    latex_feasible += "+";
                }
                latex_feasible += String(-con_lhs[i][1]) + "y";
                if (con_rhs[i] >= 0) {
                    latex_feasible += "+";
                }
                latex_feasible += String(con_rhs[i]) + ",";
        }
    }

    // 可行域：自变量
    for (let i = 0; i < num_var; i++) {
        let var_str = i === 0 ? "x" : "y";
        if (var_sign[i] === 0) {
            let latex_var_sense = var_str + "\\geq 0";
            calculator.setExpression({latex: latex_var_sense, hidden: true});
            latex_feasible += "-" + var_str;
            if (i === 0) {
                latex_feasible += ",";
            }
        }
    }
    latex_feasible += ") \\leq 0";
    // **填充可行域（仅交集部分）**
    calculator.setExpression({
        id: "feasible_region",
        latex: latex_feasible,
    });

    // **目标函数等值线**
    let latex_sign = obj_coe[1] >= 0 ? "+" : "";
    let latex_obj =
        String(obj_coe[0]) + "x" + latex_sign + String(obj_coe[1]) + "y=c";

    calculator.setExpression({
        id: "objective",
        latex: latex_obj,
        lineStyle: Desmos.Styles.DASHED,
    });
    // 设置变量 c 的初始值为 0（生成 slider）
    calculator.setExpression({
        id: "slider-c",
        latex: "c = 0",
    });
}
