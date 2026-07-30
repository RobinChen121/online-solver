---
title: About
layout: page
permalink: /about/
---

More information about me is in <a href="https://robinchen121.github.io" target="_blank" rel="noopener">my personal
website</a>.


**Table of Contents**
- [Textbook solver](#textbook-solver)
  - [Tableau implementation](#tableau-implementation)
- [Milestones](#milestones)

---

# Textbook solver

This is a linear programming solver based on classical methods in some text books (e.g., Bertsimas, D. and Tsitsiklis, J.N., 1997. Introduction to linear optimization. Belmont, MA: Athena scientific.), without the advanced optimization and acceleration techniques found in commercial/industrial solvers.

The standard form of a linear programming problem is shown below. Any linear program must first be converted into this form before applying the simplex algorithm:

$$
\begin{aligned}
\text{min}\quad &\mathbf{c'x}\\
\text{s.t.}\quad & \mathbf{Ax=b}\\
& \mathbf{x\ge 0.}
\end{aligned}
$$

## Tableau implementation
In textbooks, the simplex algorithm is usually in tableau implementation as the following structure.

| $-\mathbf{c_B B^{-1}b}$ | $\mathbf{c'-c'_{B}B^{-1}A}$ |
| :---: | :---: |
| $\mathbf{B^{-1}b}$ | $\mathbf{B^{-1}A}$ |


The detailed steps are:

>1. Initialization
> - Begin with an initial tableau associated with a basis matrix $\mathbf{B}$.
> 
>2. Optimality Check & Pivot Column Selection
>- Examine the reduced costs ($\bar c_j=c_j-\mathbf{c_B'B^{-1}A}_j$, where $\mathbf{u} = \mathbf{B}^{-1}\mathbf{A}_j$  is the $j\text{th}$ column of the tableau) in Row 0 of the tableau: 
>    - Termination: If all reduced costs  are non-negative, the current solution $\mathbf{c_B B^{-1}b}$ is optimal and terminate the algorithm.
>    - Pivot column selection: Otherwise, select an entering column $j$ for which $\bar{c}_j < 0$ following a specific rule:
>      - Dantzig's rule (choose the column which has the most negative reduced cost)
>      - Bland's rule (choose the smallest index from those columns with negative reduced cost)
>      - Lexicographic rule (choose arbitrarily from those columns with negative reduced cost)
>      
> 3. Unboundedness Test
>    - Compute the pivot column vector $\mathbf{u} = \mathbf{B}^{-1}\mathbf{A}_j$ ($j\text{th}$ column of the tableau):
>      - Termination: If no component of $\mathbf{u}$ is positive ($\mathbf{u} \le 0$), the problem is unbounded (optimal cost is $-\infty$); terminate the algorithm.
> 
> 4. Pivot Row Selection
>- For each $i$ where $u_i > 0$, compute the ratio $x_{B(i)}/u_i$:
>   - Identify the row index $\ell$ following some rule:
>         - Dantzig'rule (choose the one that yields the minimum ratio)
>         - Bland's rule (choose the smallest index from those rows with tied minimum ratio)
>         - Lexicographic rule (for each row $i$ with $u_i>0$, divide it by $u_i$, choose the lexicographically smallest row)
>   - Column $\mathbf{A}_{B(\ell)}$ exits the basis, and column $\mathbf{A}_j$ enters the basis.
>   
> 5. Tableau Update (Pivoting)
>   - Perform elementary row operations to update the tableau: scale the $\ell\text{th}$ row (pivot row) so that the pivot element $u_\ell$ becomes $1$, and eliminate all other entries in the pivot column to $0$.

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
- 2026/07/30: add a sidebar for switching between different solvers in the future.



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