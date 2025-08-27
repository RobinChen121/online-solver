/**
 * @typedef {Object} MathJax
 * @property {function(Array<string|Element>=):void} typeset
 * @property {function(Array<string|Element>=):Promise<void>} typesetPromise
 * @property {function(Array<string|Element>=):void} typesetClear
 */

// globe variables
let obj_sense = 0; // 0 表示 min，1 表示 max
let obj_coe = [2, 3];
let con_lhs = [[2, 1], [1, 2]];
let con_rhs = [4, 5];
let con_sense = [0, 0]; // 0 表示 <=, 1 表示 >=, 2 表示 =
let var_type = [0, 0]; // 0 表示非负连续，1 表示连续，2 表示 0-1 变量，3 表示整数变量

let num_constraint = 2;

// let obj_latex_str = "";
// let con_latex_str = [];
// let var_type_latex_str = "";
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


function getNumVar() {
    /** @type {HTMLInputElement} */
    const elt = document.getElementById("input_num");
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
    document.getElementById("button_standardize_model").disabled = true;

    let num_var = getNumVar();
    obj_coe.length = num_var; // js 数组的 length 可以动态变化
    con_lhs.length = 0;
    con_sense.length = 0;
    con_rhs.length = 0;
    var_type.length = 0;
    document.getElementById("model_latex").innerText = "";
    let coeContainer = document.getElementById("objCoeContainer");
    // 清空容器，确保每次点击按钮时重新生成输入框
    coeContainer.innerHTML = "";
    // 根据给定数目生成输入框
    for (let i = 0; i < num_var; i++) {
        // 创建新的 <input> 元素
        /** @type {HTMLElement} */
        const label = document.createElement("label");
        /** @type {HTMLElement} */
        const input = document.createElement("input");
        input.type = "number"; // 设置输入框类型为文本
        input.id = "coe_obj" + i; // 设置输入框 ID（可选）
        input.style.width = "50px";
        input.style.marginLeft = "0.3%";
        label.style.marginLeft = "0.3%";
        input.value = "0"; // 默认值
        label.setAttribute("for", "coe_obj" + i);
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
    const n = var_type.length;
    for (let i = 0; i < n; i++) {
        const select = document.getElementById("select_var_type" + (i + 1));
        if (select !== null) {
            select.addEventListener("change", function () {
                var_type[i] = Number(this.value);
            });
        }
    }

    for (let i = 0; i < n; i++) {
        if (var_type[i] === 0 || var_type[i] === 1) {
            console.log(var_type[i]);
        } else {
            showAlert();
            break;
        }
    }
}

function inputObj() {
    // 让决策变量数量输入框实效
    document.getElementById("input_num").disabled = true;
    document.getElementById("select_obj_sense").disabled = true;
    num_constraint = 0;
    let {value: n} = document.getElementById("input_num"); // 获取 id 为 input_num 的标签中的 value 值
    n = Math.max(1, parseInt(n)); // parseInt() 是 JavaScript 用于将字符串转换为整数的内置函数

    // 得到输入框的系数
    for (let i = 0; i < n; i++) {
        let input_id = "coe_obj" + i;
        /**@type {HTMLInputElement} */
        let input = document.getElementById(input_id);
        obj_coe[i] = Number(input.value);
    }

    // let obj_str = "";
    // obj_str += formulaToLatex(obj_coe);
    // obj_latex_str = obj_str;
    renderLatexModel(obj_sense, obj_coe);
}

/**
 * 将一个约束条件lhs或目标函数系数的数值型数组转化为 latex代码
 * @param arr{number[]}
 */
function formulaToLatex(arr) {
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
        latex_str += `x_{${i + 1}}`;
    }
    return latex_str;
}

/**
 * transform one constraint to latex text
 * @param arr{number[]}: left hand side coefficients of the constraint
 * @param sense{number}
 * @param rhs{number}
 * @returns {string}
 */
function constraintToLatex(arr, sense, rhs) {
    let latex_str = formulaToLatex(arr);
    let sense_str = sense === 0 ? "\\leq" : sense === 1 ? "\\geq" : "=";
    return latex_str + sense_str + String(rhs);
}

/**
 *
 * @param var_type {number[]}
 * @returns {string}
 */
function varTypeToLatex(var_type) {
    let n = var_type.length;
    let var_type_latex = "";
    for (let i = 0; i < n; i++) {
        let value = var_type[i];
        if (value === 0) {
            var_type_latex += `x_{${i + 1}}\\geq 0`;
        } else if (value === 2) {
            var_type_latex += `x_{${i + 1}}\\in \\{0,1\\}`;
        } else if (value === 3) {
            var_type_latex += `x_{${i + 1}}\\in \\mathbb\\{Z\\}`;
        }

        if (value !== 1) {
            if (i < n - 1) {
                var_type_latex += ",";
            } else {
                var_type_latex += ".";
            }
        }

        if (i === n - 1 && value === 1) {
            var_type_latex = var_type_latex.slice(0, -1) + ".";
        }
    }
    return var_type_latex;
}

// /**
//  * 将一个约束条件的lhs或目标函数表达式的字符串转化为 latex代码
//  * @param arr{string[]}
//  * @returns {string}
//  */
// function formulaToLatex2(arr) {
//     let latex_str = "";
//     let n = arr.length;
//     // ${} 用于 模板字符串（Template Literals），允许在字符串中嵌入变量或表达式
//     // 反引号 ``：用于 模板字符串，支持 ${} 变量插值
//     for (let i = 0; i < n; i++) {
//         if (parseFloat(arr[i]) >= 0 && i > 0) {
//             latex_str += "+";
//         }
//         if (parseFloat(arr[i]) !== 1) {
//             if (parseFloat(arr[i]) !== -1) {
//                 latex_str += arr[i];
//             } else {
//                 latex_str += "-";
//             }
//         }
//         latex_str += `x_{${i + 1}}`;
//     }
//     return latex_str;
// }

/**
 *
 * @param obj_sense{number}
 * @param obj_coe{number[]}
 * @param con_lhs{number[][]}
 * @param con_sense{number[]}
 * @param con_rhs{number[]}
 * @param var_type{number[]}
 */
function renderLatexModel(obj_sense, obj_coe, con_lhs = [], con_sense = [], con_rhs = [], var_type = []) {
    let obj_sense_str = obj_sense === 1 ? "\\max" : "\\min";
    let obj_str = formulaToLatex(obj_coe);
    let latexModel = "";
    if (con_lhs.every(row => row.length === 0)) {
        // 反单引号可以创建模板字符串，即字符串里包含变量或表达式
        latexModel += `
            \\[
            ${obj_sense_str}\\quad z=${obj_str}
            \\]
            `;
    } else if (var_type.length === 0) {
        let num_con = con_lhs.length;
        let con_body_str = "";
        for (let i = 0; i < num_con; i++) {
            con_body_str += "&" + constraintToLatex(con_lhs[i], con_sense[i], con_rhs[i]) + "\\\\";
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
        let num_con = con_lhs.length;
        let var_type_str = varTypeToLatex(var_type);
        let con_body_str = "";
        for (let i = 0; i < num_con; i++) {
            con_body_str += "&" + constraintToLatex(con_lhs[i], con_sense[i], con_rhs[i]) + "\\\\";
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

    document.getElementById("model_latex").innerHTML = latexModel;
    MathJax.typeset(); // typeset 适用于小型公式更新，局部重新渲染, typesetPromise适合大规模更新
}

// function renderLatexModel2(obj_str, con_str = "", var_type_str = "") {
//     let select_obj_sense = obj_sense;
//     let obj_sense_str;
//     // 因为在 HTML 中，select 的 value 是字符串类型，所以应该与字符串 "1" 进行比较，而不是数字 1
//     if (select_obj_sense === 1) {
//         obj_sense_str = "\\max";
//     } else {
//         obj_sense_str = "\\min";
//     }
//
//     let latexModel = "";
//     if (con_str === "") {
//         latexModel += `
//             \\[
//             ${obj_sense_str}\\quad z=${obj_str}
//             \\]
//             `;
//     } else if (var_type_str === "") {
//         let num_con = con_str.length;
//         let con_body_str = "";
//         for (let i = 0; i < num_con; i++) {
//             con_body_str += "&" + con_str[i] + "\\\\";
//         }
//         latexModel += `
//             \\[
//             \\begin{aligned}
//             ${obj_sense_str}\\quad &${obj_str}\\\\
//             \\text{s.t.}\\quad&\\\\
//             ${con_body_str}
//             \\end{aligned}
//             \\]
//             `;
//     } else {
//         let num_con = con_str.length;
//         let con_body_str = "";
//         for (let i = 0; i < num_con; i++) {
//             con_body_str += "&" + con_str[i] + "\\\\";
//         }
//         latexModel += `
//             \\[
//             \\begin{aligned}
//             ${obj_sense_str}\\quad &${obj_str}\\\\
//             \\text{s.t.}\\quad&\\\\
//             ${con_body_str}
//             &${var_type_str}
//             \\end{aligned}
//             \\]
//             `;
//     }
//
//     document.getElementById("model_latex").innerHTML = latexModel;
//     MathJax.typeset(); // typeset 适用于小型公式更新，局部重新渲染, typesetPromise适合大规模更新
// }

function inputConstraint() {
    let num_var = getNumVar();
    document.getElementById("button_input_obj_coe").disabled = true;
    document.getElementById("button_generate_obj").disabled = true;

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
        input.style.width = "50px";
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
    select.id = "constraint_sense";

    select.style.marginLeft = "0.5%";

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
    let num_var = getNumVar();
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
    con_rhs.push(this_rhs);

    // let constraint_str = formulaToLatex(this_lhs);
    // constraint_str += this_sense;
    // constraint_str += " " + this_rhs;
    // con_latex_str.push(constraint_str);
    // renderLatexModel(obj_latex_str, con_latex_str);

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
    let num_var = getNumVar();
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
        label.setAttribute("for", "var_type" + (i + 1));

        // 创建多个 option 元素
        let option1 = document.createElement("option");
        option1.textContent = "≥ 0 continuous";
        option1.value = "0";
        option1.selected = true;
        let option2 = document.createElement("option");
        option2.value = "1";
        option2.textContent = "continuous";
        let option3 = document.createElement("option");
        option3.textContent = "binary";
        option3.value = "2";
        let option4 = document.createElement("option");
        option4.textContent = "integer";
        option4.value = "3";

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
    document.getElementById("button_standardize_model").disabled = false;
    let num_var = getNumVar();
    if (num_var === 2) {
        document.getElementById("button_draw_picture").disabled = false;
    }

    var_type.length = num_var;
    for (let i = 0; i < num_var; i++) {
        let select_id = "select_var_type" + (i + 1);
        /**@type {HTMLElement} */
        let select = document.getElementById(select_id);
        const {value} = select;
        var_type[i] = Number(value);
    }
    renderLatexModel(obj_sense, obj_coe, con_lhs, con_sense, con_rhs, var_type);
}

function reset() {
    document.getElementById("input_num").disabled = false; // 让按钮恢复可点击
    document.getElementById("input_num").value = "2";
    document.getElementById("select_obj_sense").disabled = false;
    document.getElementById("button_input_obj_coe").disabled = false;
    document.getElementById("button_draw_picture").disabled = false;
    document.getElementById("button_generate_obj").disabled = true;
    document.getElementById("button_input_constr").disabled = true;
    document.getElementById("button_add_constr").disabled = true;
    document.getElementById("button_remove_constr").disabled = true;
    document.getElementById("button_select_variable_type").disabled = true;
    document.getElementById("button_generate_full_model").disabled = true;
    document.getElementById("button_standardize_model").disabled = false;

    // con_latex_str = [];
    // obj_latex_str = "";
    // var_type_latex_str = "";
    document.getElementById("constr_input_container").innerHTML = "";
    document.getElementById("var_type_container").innerHTML = "";
    document.getElementById("objCoeContainer").innerHTML = "";

    obj_coe = [2, 3];
    obj_sense = 0;
    con_lhs = [
        [2, 1],
        [1, 2],
    ];
    con_sense = [0, 0];
    con_rhs = [4, 5];
    var_type = [0, 0];
    num_constraint = 2;

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

    let num_var = getNumVar();
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
        if (var_type[i] === 0) {
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
