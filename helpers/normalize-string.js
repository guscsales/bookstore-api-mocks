function normalizeString(value) {
  const alphabetSpecialChars = 'àáäâãèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
  const alphabetCommonChars = 'aaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';

  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/ /g, '')
    .replace(/[&/\\#,+()$~%.'":*?<>{}-]/g, '')
    .replace(new RegExp(alphabetSpecialChars.split('').join('|'), 'g'), (c) =>
      alphabetCommonChars.charAt(alphabetSpecialChars.indexOf(c))
    );

  return normalizedValue;
}

module.exports = normalizeString;
