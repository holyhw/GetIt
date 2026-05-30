let _file: File | null = null;
let _url: string | null = null;

export const registerStore = {
  setPhoto: (url: string | null, file: File | null) => { _url = url; _file = file; },
  getUrl: () => _url,
  getFile: () => _file,
  clear: () => { _url = null; _file = null; },
};
