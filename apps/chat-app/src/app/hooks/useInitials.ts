import { useMemo } from 'react';

// Custom hook to extract the first letters of a word
function useInitials(name) {
  
    if (!name || typeof name !== 'string') {
      return '';
    }

    // Split the name into words
    const words = name.trim().split(' ');

    // Extract the first letter of each word and join them
    const initials = words.map(word => word.charAt(0)).join('');

    
    return initials || 'DR';

}

export default useInitials;