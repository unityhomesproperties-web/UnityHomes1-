with open("src/components/AreaIntelligencePage.tsx", "r") as f:
    content = f.read()

autosave_logic = """  const [formData, setFormData] = useState<any>(() => {
    const saved = localStorage.getItem('areaIntelligenceDraft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      location: { state: '', lga: '', area: '', estate: '', yearsLived: '', relationship: '' },
      ratings: {},
      housing: { rent: '', propertyType: '', availability: '', ease: '', trend: '' },
      experience: { recommend: '', best: '', challenge: '', suggestions: '' },
      consent: { required: false, optional: true }
    };
  });

  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem('areaIntelligenceStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  useEffect(() => {
    localStorage.setItem('areaIntelligenceDraft', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('areaIntelligenceStep', step.toString());
  }, [step]);
"""

import re
content = re.sub(r"  const \[step, setStep\] = useState\(1\);\n.*?consent: \{ required: false, optional: true \}\n  \}\);", autosave_logic, content, flags=re.DOTALL)

with open("src/components/AreaIntelligencePage.tsx", "w") as f:
    f.write(content)
