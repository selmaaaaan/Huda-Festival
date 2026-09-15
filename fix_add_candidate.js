const fs = require('fs');

let c = fs.readFileSync('admin-hudafestival-main/src/components/AddCandidate.jsx', 'utf8');

c = c.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");

const search = `  const [formData, setFormData] = useState({ 
    admissionNo: initialData?.admissionNo || '', 
    name: initialData?.name || '',
    selectedTeam: initialData?.team?._id || initialData?.team || teamId || '',
    selectedCategory: initialData?.category || categoryName || ''
  });`;

const replace = `  const [formData, setFormData] = useState({ 
    admissionNo: initialData?.admissionNo || '', 
    name: initialData?.name || '',
    selectedTeam: initialData?.team?._id || initialData?.team || teamId || '',
    selectedCategory: initialData?.category || categoryName || ''
  });

  useEffect(() => {
    setFormData({
      admissionNo: initialData?.admissionNo || '', 
      name: initialData?.name || '',
      selectedTeam: initialData?.team?._id || initialData?.team || teamId || '',
      selectedCategory: initialData?.category || categoryName || ''
    });
  }, [initialData, teamId, categoryName]);`;

c = c.replace(search, replace);

fs.writeFileSync('admin-hudafestival-main/src/components/AddCandidate.jsx', c, 'utf8');
console.log("Fixed AddCandidateForm");