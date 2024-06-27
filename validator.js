const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function validator(formSelector, submitCallback) {
  let formRules = {};
  let formData = {};
  function addRulesFunctionToFormRules(
    input,
    rule,
    isParentFunction,
    valueChildrenFunction
  ) {
    let functionRule = validatorRules[rule];
    if (isParentFunction) {
      functionRule = functionRule(valueChildrenFunction);
    }
    if (functionRule)
      if (Array.isArray(formRules[input.name])) {
        formRules[input.name].push(functionRule);
      } else {
        formRules[input.name] = [functionRule];
      }
  }

  /**
   * Quy ước tạo rule:
   * Nếu có lỗi thì return 'error message'
   * Nếu kh có lỗi thì return 'undefined'
   */
  let validatorRules = {
    required: function (value) {
      return value ? undefined : "Vui lòng nhập trường này";
    },

    email: function (value) {
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Email không hợp lệ";
    },

    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Vui lòng nhập ít nhất ${min} kí tự`;
      };
    },

    max: function (max) {
      return function (max) {
        return value.length >= max
          ? undefined
          : `Vui lòng nhập ít nhất ${max} kí tự`;
      };
    },
  };

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  function handleValidate(event) {
    let rules = formRules[event.target.name];
    let errorMessage;
    rules.find((rule) => {
      errorMessage = rule(event.target.value);
      return errorMessage;
    });
    if (errorMessage) {
      let formGroup = getParent(event.target, ".form-group");
      if (formGroup) {
        let formMessage = formGroup.querySelector(".form-message");
        if (formMessage) {
          formMessage.innerText = errorMessage;
          formGroup.classList.add("invalid");
        }
      }
    }

    return !errorMessage;
  }

  function handleClearError(event) {
    let formGroup = getParent(event.target, ".form-group");
    if (formGroup.classList.contains("invalid")) {
      formGroup.classList.remove("invalid");
      let formMessage = formGroup.querySelector(".form-message");
      if (formMessage) {
        formMessage.innerText = "";
      }
    }
  }

  let formElement = $(formSelector);

  if (formElement) {
    // lấy ra inputs có name và rules
    let inputs = formElement.querySelectorAll("[name][rules]");

    for (let input of inputs) {
      let rules = input.getAttribute("rules").split("|");
      formRules[input.name] = input.getAttribute("rules");

      // lặp qua từng rule của từng input
      for (let rule of rules) {
        if (rule.includes(":")) {
          let ruleInfo = rule.split(":");
          rule = ruleInfo[0];
          addRulesFunctionToFormRules(
            input,
            rule,
            typeof validatorRules[rule](ruleInfo[1]) === "function",
            ruleInfo[1]
          );
        } else {
          addRulesFunctionToFormRules(input, rule);
        }
      }

      // lắng nghe sự kiện onblur, onchange
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }

    console.log(formRules);

    // xử lí hành vi onsubmit
    formElement.onsubmit = function (event) {
      event.preventDefault();
      if (formElement) {
        // lấy ra inputs có name và rules
        let inputs = formElement.querySelectorAll("[name][rules]");
        var isValid = false;
        for (let input of inputs) {
          isValid = handleValidate({ target: input });
          formData[input.name] = input.value;
        }
        if (isValid) {
          submitCallback();
          submitCallback(formData);
        }
      }
    };
  }
}
