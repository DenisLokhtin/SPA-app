const validateXHTML = (xhtmlText) => {
  const regex = /<(a|code|i|strong)(\s.*?)?>(.*?)<\/\1>/g;

  if (regex.test(xhtmlText)) {
    return xhtmlText.replace(regex, '').trim() === '';
  } else {
    return /^[a-zA-Z0-9\s]+$/.test(xhtmlText);
  }
};

export default validateXHTML;
