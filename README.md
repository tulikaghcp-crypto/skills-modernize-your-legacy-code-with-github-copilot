# Modernize your legacy code with GitHub Copilot

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey tulikaghcp-crypto!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/tulikaghcp-crypto/skills-modernize-your-legacy-code-with-github-copilot/issues/1)

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

### Sequence diagram

```mermaid
sequenceDiagram
    participant User
    participant MainProgram
    participant Operations
    participant DataProgram

    User->>MainProgram: start / choose option
    MainProgram->>Operations: CALL with TOTAL/CREDIT/DEBIT
    alt view balance
        Operations->>DataProgram: CALL 'READ'
        DataProgram-->>Operations: return balance
        Operations-->>MainProgram: display balance
    else credit
        Operations-->>MainProgram: prompt for amount
        MainProgram-->>Operations: amount entered
        Operations->>DataProgram: CALL 'READ'
        DataProgram-->>Operations: return balance
        Operations->>DataProgram: CALL 'WRITE' (new balance)
        Operations-->>MainProgram: display new balance
    else debit
        Operations-->>MainProgram: prompt for amount
        MainProgram-->>Operations: amount entered
        Operations->>DataProgram: CALL 'READ'
        DataProgram-->>Operations: return balance
        alt sufficient funds
            Operations->>DataProgram: CALL 'WRITE' (new balance)
            Operations-->>MainProgram: display new balance
        else insufficient
            Operations-->>MainProgram: display error
        end
    end