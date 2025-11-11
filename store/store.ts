import { configureStore } from '@reduxjs/toolkit'
// import courseReducer from './course-slice'
import robotReducer from './robot-slice'
// import userCourseReducer from './user-course-slice'

export const store = configureStore({
  reducer: {
    robot: robotReducer,
    // course: courseReducer,
    // userCourse: userCourseReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch