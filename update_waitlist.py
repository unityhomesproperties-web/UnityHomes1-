import re

with open('src/components/WaitlistModal.tsx', 'r') as f:
    content = f.read()

# Add imports
imports = """import { db } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
"""

if "import { db } from '../lib/firebase';" not in content:
    content = content.replace("import { useNavigate } from 'react-router-dom';", 
                              "import { useNavigate } from 'react-router-dom';\n" + imports)

# Replace handleSubmit
new_handleSubmit = """  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!data.information_confirmed) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const waitlistRef = doc(collection(db, 'waitlist'));
      const payload = {
        role: data.role,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        state: data.state,
        role_specific_data: data.role_specific_data,
        information_confirmed: data.information_confirmed,
        createdAt: serverTimestamp()
      };
      
      await setDoc(waitlistRef, payload);

      clearAutosave();
      onClose();
      navigate('/waitlist/success');
      
    } catch (err: any) {
      console.error(err);
      if (!err.message) {
         setSubmitError("We couldn't complete your registration right now. Your information has not been lost. Please try again.");
      } else {
         setSubmitError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };"""

content = re.sub(
    r'  const handleSubmit = async \(e: FormEvent\) => \{[\s\S]*?setIsSubmitting\(false\);\n    \}\n  \};',
    new_handleSubmit,
    content
)

with open('src/components/WaitlistModal.tsx', 'w') as f:
    f.write(content)
print("Updated WaitlistModal.tsx")
