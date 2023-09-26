import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserContextProvider, { useUserContext } from './UserContextProvider';

export default function LoginComponent() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    
    const [errors, setErrors] = useState({
        email: '',
        password: []
    });
    const { user,setUser } = useUserContext();
    const navigate = useNavigate();

    const inputClass = 'block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-sm border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-slate-600 focus:outline-none focus:ring-0 focus:border-slate-200 peer';
    const labelClass = 'absolute text-sm tracking-wide text-neutral-400 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-slate-600 peer-focus:font-bold peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1';
    const handleChange = (event: { target: { name: any; value: any; }; }) =>{
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
        if(!formData.email.match(/^\S+@\S+\.\S+$/)){
          newErrors.email = "Please enter a valid email address";
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
          
          const {email, password} = formData;
        //   console.log({ email, password});
          axios.post(`http://localhost:3333/api/login`,  {email, password},{withCredentials:true})
          .then(response=>{
            console.log("resp =>", response);
            // console.log();
            const userDetails = response.data.data;
            
            setUser(userDetails);

            
            navigate('/');
          })
    
        }
    }
  return (
    <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 '>       
        <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
            <div>
                <h1 className="text-lg font-mono font-medium text-gray-700 md:text-xl dark:text-white">
                    Sign In
                </h1>  
                <form className="mt-6 grid gap-4 lg:gap-6 font-mono" onSubmit={(event: React.FormEvent<HTMLFormElement>) => handleSubmit(event)} >
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
                    Login
                </button>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Don't have an account? <Link to="/register" className="font-medium text-sky-600 hover:underline dark:text-sky-500">CREATE ACCOUNT</Link>.
                </p>
                </form>
            </div>
        </div>
    </div>
    
  )
}
