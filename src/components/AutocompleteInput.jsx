import { Autocomplete, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

const AutocompleteInput = ({ label, onPlaceSelect }) => {
  const [keyword, setKeyword] = useState('');
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!keyword || typeof window.kakao === 'undefined') return;

    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        console.log('🔍 검색 결과:', data); // ✅ 디버깅용 로그
        setOptions(data);
      } else {
        setOptions([]);
      }
    });
  }, [keyword]);

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(opt) => opt.place_name || ''}
      onInputChange={(e, value) => setKeyword(value)}
      onChange={(e, value) => {
        if (value && typeof value !== 'string') onPlaceSelect(value);
      }}
      renderInput={(params) => <TextField {...params} label={label} fullWidth />}
    />
  );
};

export default AutocompleteInput;