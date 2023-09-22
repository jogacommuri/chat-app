import React, { useState } from 'react'

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

  const inputClass = 'block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-sm border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-slate-600 focus:outline-none focus:ring-0 focus:border-slate-200 peer';
  const labelClass = 'absolute text-sm tracking-wide text-neutral-400 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-slate-600 peer-focus:font-bold peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1'
  const handleChange = (event) =>{
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
  const handleSubmit = (event) =>{
    event.preventDefault();
    if(validateForm()){
      console.log("FORM VALID DO NEXT STEPS")
      console.log(formData.firstName,formData.lastName,formData.email,formData.password)
    }
  }
  return (
    <div>
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
              ${errors.password.length>0 ? 'text-red-500' : ''}`}>
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
      </form>
      {/* <form className="space-y-4 md:space-y-6" action="#">
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
            <input 
            type="email" 
            name="email" 
            id="email" 
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="name@company.com"  />
        </div>
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
            <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div>
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
            <input 
            type="confirm-password" 
            name="confirm-password" 
            id="confirm-password" 
            placeholder="••••••••" 
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            />
        </div>
        <div className="flex items-start">
            <div className="flex items-center h-5">
              <input 
              id="terms" 
              aria-describedby="terms"
               type="checkbox" 
               className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" 
               />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-light text-gray-500 dark:text-gray-300">
                I accept the <a className="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#">Terms and Conditions</a></label>
            </div>
        </div>
        <button 
        
        className="w-full text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Create an account
        </button>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
            Already have an account? <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</a>
        </p>
      </form> */}
    </div>
  )
}
