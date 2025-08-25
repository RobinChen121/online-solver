---
layout: home
---
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
        <option value='\\min' selected>Min</option>
        <option value='\\max'>Max</option>
    </select>

    <button id="button_reset" onclick="reset()" style="position: relative; float: right;">Reset
    </button>

</p>

<p>
    <button id="button_input_obj_coe" onclick="inputObjCoefficients()">Input objective
        coefficients
    </button>
    <!--<p id="ini_obj">$$x_1 + x_2$$</p>-->
    <!--<div> 是一个 HTML 元素，常用于分组和布局，不会直接显示任何内容，但可以用于包含其他 HTML 元素-->
</p>
<div id="objCoeContainer"></div>

<p></p>
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

<div id='constr_input_container'></div>  <!-- <div> 是 块级元素（block element），不能嵌套在 <p> 里 -->

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

    <button id="button_draw_picture" style="margin-top: 1%; margin-left:3%" onclick="drawPicture()"
    >Draw picture for 2D model
    </button>

    <button id="standardize_model" style="margin-top: 1%; margin-left:3%" onclick="standardizeModel()"
    >Standardize the model
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

<div id="calculator">
    <ul>
        <li>
            \( x_1 \) and \( x_2 \) of the model are replaced by \( x \) and \( y \) in the picture.
        </li>
        <li>
            You may need to zoom in/out the picture to show the full feasible region.
        </li>
    </ul>
</div>
