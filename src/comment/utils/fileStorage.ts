import typesDictionary from './typesDictionary';

export const saveFileToStorage = {
  fileFilter: (req, file, cb) => {
    typesDictionary.hasOwnProperty(file.mimetype)
      ? cb(null, true)
      : cb(null, false);
  },
};
