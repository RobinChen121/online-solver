---
title: About
layout: page
permalink: /about/
---

More information about me is in <a href="https://robinchen121.github.io" target="_blank" rel="noopener">my personal
website</a>.


**Table of Contents**
- [Textbook solver](#textbook-solver)
- [Milestones](#milestones)

---

# Textbook solver

This is a linear programming solver based on classical methods in some text books (e.g., Bertsimas, D. and Tsitsiklis, J.N., 1997. Introduction to linear optimization. Belmont, MA: Athena scientific.), without the advanced optimization and acceleration techniques found in commercial/industrial solvers.

The standard form of a linear programming problem is shown below. Any linear program must first be converted into this form before applying the simplex algorithm:

$$
\begin{align*}
\text{min}\quad &\mathbf{c'x}\\
\text{s.t.}\quad & \mathbf{Ax=b}\\
& \mathbf{x\ge 0.}
\end{align*}
$$

In textbooks, the simplex algorithm is usually in tableau implementation. The detailed steps are:

> 1. Starts with the tableau associated with a basis matrix $\mathbf{B}$ and the corresponding basic feasible solution $\mathbf{x}$.  
> 2. Examine the reduced costs in the zeroth row of the tableau. If they are all non-negative, the current basic feasible solution is optimal, and the algorithm terminates; else, choose some $j$ for which the reduced cost $\bar{c}_j < 0$ following some rule:
>    - Most negative rule
>    - Bland rule
>    - Lexicography rule
> 3. Consider the vector $\mathbf{u} = \mathbf{B}^{-1}\mathbf{A}_j$, which is the $j\text{th}$ column (the pivot column) of the tableau. If no component of $\mathbf{u}$ is positive, the optimal cost is $-\infty$, and the algorithm terminates.
> 4. For each $i$ for which $u_i$ is positive, compute the ratio $x_{B(i)}/u_i$. Let $\ell$ be the index of a row that corresponds to the smallest ratio. The column $\mathbf{A}_{B(\ell)}$ exits the basis and the column $\mathbf{A}_j$ enters the basis.
> 5. Add to each row of the tableau a constant multiple of the $\ell\text{th}$ row (the pivot row) so that $u_\ell$ (the pivot element) becomes one and all other entries of the pivot column become zero.


# Milestones

Milestones for this online solver:

- 2025/04/03: set up all the inputs of the objective and constraints for a model, and
  use [Desmos](https://www.desmos.com/) to generate the 2D picture.
- 2025/04/06: add the graphic method.
- 2025/08/23: improve the theme toggle switching.
- 2025/08/25: develop the online tetris game with the help of [Cursor](https://cursor.com/home).
- 2025/08/31: add the function and button of standardizing the model.
- 2025/10/10: add the solve button in which the simplex algorithm is developed by C++.
- 2026/01/04: add a button and function to show detailed tableau in Simplex computation.
- 2026/03/16: update some functions so that they can track changes in the input values.
- 2026/03/19: polished the website's layout and styling.
- 2026/03/29: make the basic variables shown in the output tableau.
- 2026/04/02: provide 3 pivoting rules and define the CSS for the component Radio.
- 2026/04/24: provide some linear programming examples for users to select and define the CSS for Modal and Alert.
- 2026/04/25: revise the memory leakage issue when using WASM from C++.



<script src="https://giscus.app/client.js"
        data-repo="RobinChen121/solver"
        data-repo-id="R_kgDOOPOM7Q"
        data-category="General"
        data-category-id="DIC_kwDOOPOM7c4C5jLU"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="en"
        crossorigin="anonymous"
        async>
</script>