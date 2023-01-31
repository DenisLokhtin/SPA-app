const validateXHTML = (xhtmlText) => {
  const regex = /<(a|code|i|strong)(\s.*?)?>(.*?)<\/\1>/g;

  return xhtmlText.replace(regex, '').trim() === '';
};

export default validateXHTML;
