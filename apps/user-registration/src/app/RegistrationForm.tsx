import React, { useState , useContext} from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import UserContextProvider, { useUserContext } from './UserContextProvider';

export default function UserRegistrationForm() {

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail:'',
    password: ''
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email:'',
    confirmEmail:'',
    password: []
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const { user, setUser } = useUserContext();
  const navigate = useNavigate();
  
  const inputClass = 'block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-sm border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-slate-600 focus:outline-none focus:ring-0 focus:border-slate-200 peer';
  const labelClass = 'absolute text-sm tracking-wide text-neutral-400 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-slate-600 peer-focus:font-bold peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1'
  const handleChange = (event:any) =>{
    const {name, value} = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear errors when input changes
    setErrors({
      ...errors,
      [name]: '',
    });
  };
  const validateForm = () =>{
    let valid = true;
    const newErrors: any = {};
    if(formData.firstName.trim() === ''){
      newErrors.firstName = "Please enter your first name";
      valid= false;
    }else if (/\d/.test(formData.firstName)) {
      newErrors.firstName = 'First Name cannot contain numeric characters';
      valid = false;
    }
    if(formData.lastName.trim()=== ''){
      newErrors.lastName = "Please enter your last name";
      valid= false;
    }else if (/\d/.test(formData.lastName)) {
      newErrors.lastName = 'Last Name cannot contain numeric characters';
      valid = false;
    }

    if(!formData.email.match(/^\S+@\S+\.\S+$/)){
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }
    if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Your email and confirmation email must match';
      valid = false;
    }
  
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      valid = false;
    }
     // Additional Password Validations (e.g., complexity requirements)
     if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)) {
      newErrors.password = ['At least 1 letter',
        'At least 1 number',
        'Minimum of 8 characters',
        'At least 3 unique characters'];
      valid = false;
    }
    setErrors(newErrors);

    return valid;
  }
  const handleSubmit = async (event) =>{
    event.preventDefault();
    if(validateForm()){
      console.log("FORM VALID DO NEXT STEPS")
      
      const {firstName, lastName, email, password} = formData;
      
      axios.post(`http://localhost:3333/api/register`, {firstName, lastName, email, password},{withCredentials:true})
      .then(response=>{
        console.log("resp =>", response);
        console.log({firstName, lastName, email, password});
        const name = `${firstName} ${lastName}`
        setUser({firstName, lastName, email,_id:''});
        navigate('/')
      })

    }
  }
  return (
    <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 '>       
      <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
        <div>
          {user ? (
            <h1 className="text-lg font-mono font-medium text-gray-700 md:text-xl dark:text-white">
            welcome {user.firstName} {user.lastName}
            </h1> 
          ) :  (
          <div>
            <h1 className="text-lg font-mono font-medium text-gray-700 md:text-xl dark:text-white">
            Create account
            </h1>  
            <form className="mt-6 grid gap-4 lg:gap-6 font-mono" onSubmit={handleSubmit} >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="relative">
                    <input 
                    type="text" 
                    id="first_name" 
                    className={`${inputClass}
                    ${errors.firstName ? 'border-red-500' : ''}`} 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder='First name' />
                    {errors.firstName && <p className="text-sm text-red-500 mt-2">{errors.firstName}</p>}
                    <label htmlFor="first_name" 
                    className={`${labelClass}
                    ${errors.firstName ? 'text-red-500' : ''}`}>
                      First name
                    </label>
                </div>
                <div className="relative">
                    <input 
                    type="text" 
                    id="last_name" 
                    className={`${inputClass}
                    ${errors.lastName ? 'border-red-500' : ''}`} 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder='Last name' />
                    {errors.firstName && <p className="text-sm text-red-500 mt-2">{errors.firstName}</p>}
                    <label htmlFor="last_name" 
                    className={`${labelClass}
                    ${errors.lastName ? 'text-red-500' : ''}`}>
                      Last name
                    </label>
                </div>
              </div>
              
              <div className="relative">
                <input 
                    type="email" 
                    id="email" 
                    className={`${inputClass}
                    ${errors.email ? 'border-red-500' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='Email' />
                    <label htmlFor="email" 
                    className={`${labelClass}
                    ${errors.email ? 'text-red-500' : ''}`}>
                    Email
                    </label>
                  
                {errors.email && <p className="text-sm text-red-500 mt-2">{errors.email}</p>}
              </div>
              <div className="relative">
                <input 
                    type="email" 
                    id="confirm_email" 
                    className={`${inputClass}
                    ${errors.email ? 'border-red-500' : ''}`}
                    name="confirmEmail"
                    value={formData.confirmEmail}
                    onChange={handleChange}
                    placeholder='Confirm Email' />
                    <label htmlFor="confirm_email" 
                    className={`${labelClass}
                    ${errors.confirmEmail ? 'text-red-500' : ''}`}>
                    Confirm Email
                    </label>
                  
                {errors.confirmEmail && <p className="text-sm text-red-500 mt-2">{errors.confirmEmail}</p>}
              </div>
              <div className="relative">
                <input 
                    type="text" 
                    id="password" 
                    className={`${inputClass}
                    ${errors.password ? 'text-red-500' : ''}`} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder='Password' />
                    <label htmlFor="password" 
                    className={`${labelClass}
                      ${errors.password && errors.password.length>0 ? 'text-red-500' : ''}`}>
                    Password
                    </label>
                  
                    {errors.password && errors.password.map((err,i) =>(
                      <li key={i} className="text-sm text-red-500 mt-2">{err}</li>
                    ))}
                </div>
                
                <button
                    type="submit"
                    className={`w-full bg-sky-300 text-white px-4 py-2 rounded mt-4 ${
                      (!formData.email || !formData.password) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!formData.email || !formData.password}
                  >
                  CREATE ACCOUNT
                </button>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Already have an account? <Link to="/login" className="font-medium text-sky-600 hover:underline dark:text-sky-500">Login here</Link>.
                </p>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
   
  )
}
