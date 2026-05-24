import { useEffect } from 'react';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · LabBook` : 'LabBook — ZUT Lab Booking';
  }, [title]);
};

export default usePageTitle;
