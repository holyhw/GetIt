let photoUri: string | null = null;

export const registerStore = {
  setPhoto: (uri: string | null) => { photoUri = uri; },
  getPhoto: () => photoUri,
  clear: () => { photoUri = null; },
};
