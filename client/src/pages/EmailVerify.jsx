import { useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { useApp } from '../context/AppContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const EmailVerify = () => {
  const inputRefs = useRef([])
  const otpSentRef = useRef(false)
  const { API_URL, isAuthenticated, user, checkAuth, authLoading } = useApp()
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('')
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char
      }
    })
  }

  const sendOtp = async () => {
    if (!user?.email) return
    try {
      setSending(true)
      const { data } = await axios.post(`${API_URL}/api/auth/send-verify-otp`, {
        email: user.email
      })
      if (data.success) {
        toast.success(data.message || 'OTP sent to your email')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setSending(false)
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      const otpArray = inputRefs.current.map((input) => input?.value || '')
      const otp = otpArray.join('')
      const userEmail = user?.email
      if (!userEmail) {
        return toast.error('User email is missing. Please log in again.')
      }
      if (otp.length !== 6) {
        return toast.error('Please enter the complete 6-digit OTP')
      }
      const { data } = await axios.post(`${API_URL}/api/auth/verify-account`, {
        email: userEmail,
        otp
      })
      if (data.success) {
        toast.success(data.message)
        await checkAuth()
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      navigate('/login?redirect=/email-verify')
      return
    }
    if (user?.isAccountVerified) {
      navigate('/')
      return
    }
    if (user?.email && !otpSentRef.current) {
      otpSentRef.current = true
      sendOtp()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user, navigate])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="App Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <form onSubmit={onSubmitHandler} className="bg-white p-8 rounded-2xl shadow-xl w-96 text-sm">
        <h1 className="text-gray-900 text-2xl font-semibold text-center mb-4">Verify Email</h1>
        <p className="text-center mb-6 text-gray-500">
          Enter the 6-digit code sent to {user?.email || 'your email'}
        </p>
        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input
              className="w-12 h-12 border-2 border-gray-300 text-gray-900 text-center text-xl rounded-md focus:border-orange-500 focus:ring-2 focus:ring-orange-300"
              type="text"
              maxLength="1"
              key={index}
              required
              ref={(el) => (inputRefs.current[index] = el)}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold">
          Verify Email
        </button>
        <button
          type="button"
          onClick={sendOtp}
          disabled={sending}
          className="w-full mt-3 py-2 text-orange-600 hover:text-orange-700 text-sm disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Resend OTP'}
        </button>
      </form>
    </div>
  )
}

export default EmailVerify
