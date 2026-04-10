import { createContext, useState, useContext } from 'react';

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [customTitle, setCustomTitle] = useState(null);

  return (
    <PageContext.Provider value={{ customTitle, setCustomTitle }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => useContext(PageContext);