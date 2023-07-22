export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error, accept: boolean) => void,
) => {
  //   console.log(file);
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  if (!validExtensions.includes(fileExtension))
    return callback(new Error('Type of file not supported'), false);
  callback(null, true);
};
