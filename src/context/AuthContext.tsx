import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FC,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../lib/firebase'
import type { UserProfile, UserRole } from '../types/auth'

export interface AuthContextType {
  currentUser: User | null
  userProfile: UserProfile | null
  loading: boolean
  isConfigured: boolean
  login: (email: string, pass: string, expectedRole: UserRole) => Promise<void>
  register: (
    email: string,
    pass: string,
    fullName: string,
    role: UserRole,
    extraFields?: Partial<UserProfile>
  ) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user && db) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', user.uid))
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile)
          } else {
            setUserProfile(null)
          }
        } catch (err) {
          console.error('Error fetching Firestore user profile:', err)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, pass: string, expectedRole: UserRole) => {
    if (!isFirebaseConfigured || !auth || !db) {
      throw new Error(
        'Firebase is not configured. Please supply valid credentials in .env.local.'
      )
    }

    const credential = await signInWithEmailAndPassword(auth, email, pass)
    const user = credential.user

    // Enforce role verification against Firestore profile
    const profileDoc = await getDoc(doc(db, 'users', user.uid))
    if (!profileDoc.exists()) {
      await firebaseSignOut(auth)
      throw new Error(
        'No user profile found in database. Please contact clinic administration.'
      )
    }

    const profileData = profileDoc.data() as UserProfile
    if (profileData.role !== expectedRole) {
      await firebaseSignOut(auth)
      throw new Error(
        `Access denied: Your account is registered as a ${profileData.role}, which is not authorized for the ${expectedRole} portal.`
      )
    }

    setUserProfile(profileData)
  }

  const register = async (
    email: string,
    pass: string,
    fullName: string,
    role: UserRole,
    extraFields?: Partial<UserProfile>
  ) => {
    if (!isFirebaseConfigured || !auth || !db) {
      throw new Error(
        'Firebase is not configured. Please supply valid credentials in .env.local.'
      )
    }

    const credential = await createUserWithEmailAndPassword(auth, email, pass)
    const user = credential.user

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      fullName,
      role,
      createdAt: new Date().toISOString(),
      ...extraFields,
    }

    // Persist to Firestore /users/{uid}
    await setDoc(doc(db, 'users', user.uid), newProfile)
    setUserProfile(newProfile)
  }

  const logout = async () => {
    if (auth) {
      await firebaseSignOut(auth)
    }
    setCurrentUser(null)
    setUserProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isConfigured: isFirebaseConfigured,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

