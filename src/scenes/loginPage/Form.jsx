import { useState } from "react";
import React, { useRef } from "react";
import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  Typography,
  useTheme,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import Dropzone from "react-dropzone";
import FlexBetween from "components/FlexBetween";
import { Autocomplete } from "@react-google-maps/api";

const registerSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("required")
    .test("emailComplete", "Enter the complete email", (value) => {
      if (value) {
        const [username, domain] = value.split("@");
        return !!username && !!domain && domain.includes(".");
      } else {
        return false;
      }
    }),
    password: yup
    .string()
    .required("required")
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])/,
      "Password must include at least one uppercase letter, one number, and one special character"
    ),
  location: yup.string().required("required"),
  phoneNumber: yup.string().required("required"),
  occupation: yup.string().required("required"),
  animalName: yup.string().required("required"),
  animalBreed: yup.string().required("required"),
  animalGender: yup.string().required("required"),
  animalAge: yup.string().required("required"),
  picture: yup.mixed().test("fileSelected", "Picture is required", (value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    } else {
      return !!value;
    }
  }),
});

const loginSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
});

const initialValuesRegister = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  location: "",
  phoneNumber: "",
  occupation: "",
  animalName: "",
  animalBreed: "",
  animalGender: "",
  animalAge: "",
  picture: "",
};

const initialValuesLogin = {
  email: "",
  password: "",
};

const Form = () => {
  const apiKey = "AIzaSyCHcTzGpUFqxyKBYRFWH5fskHNoZHzbi0Y";
  const autocompleteRef = useRef(null);
  const [location, setLocation] = useState(null);

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    const formattedAddress = place.formatted_address || "";
    setLocation(formattedAddress);
  };

  const [pageType, setPageType] = useState("login");
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isLogin = pageType === "login";
  const isRegister = pageType === "register";

  const register = async (values, onSubmitProps) => {
    const formData = new FormData();
    for (let value in values) {
      formData.append(value, values[value]);
    }
    formData.append("picturePath", values.picture.name);

    const savedUserResponse = await fetch(
      "http://localhost:3001/auth/register",
      {
        method: "POST",
        body: formData,
      }
    );
    const savedUser = await savedUserResponse.json();
    onSubmitProps.resetForm();

    if (savedUser) {
      setPageType("login");
    }
  };

  const login = async (values, onSubmitProps) => {
    const loggedInResponse = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const loggedIn = await loggedInResponse.json();
    onSubmitProps.resetForm();
    if (loggedIn) {
      dispatch(
        setLogin({
          user: loggedIn.user,
          token: loggedIn.token,
        })
      );
      navigate("/home");
    }
  };

  const handleFormSubmit = async (values, onSubmitProps) => {
    if (isLogin) await login(values, onSubmitProps);
    if (isRegister) await register(values, onSubmitProps);
  };

  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
      validationSchema={isLogin ? loginSchema : registerSchema}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
        resetForm,
      }) => (
        <form onSubmit={handleSubmit}>
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            sx={{
              "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
            }}
          >
            {isRegister && (
              <>
                <TextField
                  label="First Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.firstName}
                  name="firstName"
                  error={
                    Boolean(touched.firstName) && Boolean(errors.firstName)
                  }
                  helperText={touched.firstName && errors.firstName}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="Last Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.lastName}
                  name="lastName"
                  error={Boolean(touched.lastName) && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="Occupation"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.occupation}
                  name="occupation"
                  error={
                    Boolean(touched.occupation) && Boolean(errors.occupation)
                  }
                  helperText={touched.occupation && errors.occupation}
                  sx={{ gridColumn: "span 2" }}
                />
                <Autocomplete
                  onLoad={(autocomplete) => {
                    autocompleteRef.current = autocomplete;
                  }}
                  onPlaceChanged={() => {
                    const { formatted_address } =
                      autocompleteRef.current.getPlace();
                    // set form values using the formatted address
                    setFieldValue("location", formatted_address);
                  }}
                  options={{ fields: ["formatted_address", "geometry"] }}
                  apiKey={apiKey}
                >
                  <TextField
                    label="Location"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={location}
                    name="location"
                    error={
                      Boolean(touched.location) && Boolean(errors.location)
                    }
                    helperText={touched.location && errors.location}
                    sx={{ width: "210%" }}
                  />
                </Autocomplete>
                <TextField
                  label="Animal Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.animalName}
                  name="animalName"
                  error={
                    Boolean(touched.animalName) && Boolean(errors.animalName)
                  }
                  helperText={touched.animalName && errors.animalName}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="Animal Breed"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.animalBreed}
                  name="animalBreed"
                  error={
                    Boolean(touched.animalBreed) && Boolean(errors.animalBreed)
                  }
                  helperText={touched.animalBreed && errors.animalBreed}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="Animal gender"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.animalGender}
                  name="animalGender"
                  error={
                    Boolean(touched.animalGender) &&
                    Boolean(errors.animalGender)
                  }
                  helperText={touched.animalGender && errors.animalGender}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="Animal Age"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.animalAge}
                  name="animalAge"
                  error={
                    Boolean(touched.animalAge) && Boolean(errors.animalAge)
                  }
                  helperText={touched.animalAge && errors.animalAge}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="Phone Number"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.phoneNumber}
                  name="phoneNumber"
                  error={
                    Boolean(touched.phoneNumber) && Boolean(errors.phoneNumber)
                  }
                  helperText={touched.phoneNumber && errors.phoneNumber}
                  sx={{ gridColumn: "span 4" }}
                />
                <Box
                  gridColumn="span 4"
                  border={`1px solid ${palette.neutral.medium}`}
                  borderRadius="5px"
                  padding="1rem"
                >
                  <Dropzone
                    acceptedFiles=",jpg,.jpeg,.png"
                    multiple={false}
                    onDrop={(acceptedFiles) =>
                      setFieldValue("picture", acceptedFiles[0])
                    }
                  >
                    {({ getRootProps, getInputProps }) => (
                      <Box
                        {...getRootProps()}
                        border={`2px dashed ${palette.primary.main}`}
                        p="1rem"
                        sx={{ "&:hover": { cursor: "pointer" } }}
                      >
                        <input {...getInputProps()} />
                        {!values.picture ? (
                          <p>Add Picture Here</p>
                        ) : (
                          <FlexBetween>
                            <Typography>{values.picture.name}</Typography>
                            <EditOutlinedIcon />
                          </FlexBetween>
                        )}
                      </Box>
                    )}
                  </Dropzone>
                </Box>
              </>
            )}

            <TextField
              label="Email"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.email}
              name="email"
              error={Boolean(touched.email) && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              sx={{ gridColumn: "span 4" }}
            />
            <TextField
              label="Password"
              type="password"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.password}
              name="password"
              error={Boolean(touched.password) && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              sx={{ gridColumn: "span 4" }}
            />
          </Box>
          {/* BUTTONS */}
          <Box>
            <Button
              fullWidth
              type="Submit"
              sx={{
                m: "2rem, 0",
                p: "1rem",
                backgroundColor: palette.primary.main,
                color: palette.background.alt,
                "&:hover": { color: palette.primary.main },
              }}
            >
              {isLogin ? "LOGIN" : "REGISTER"}
            </Button>
            <Typography
              onClick={() => {
                setPageType(isLogin ? "register" : "login");
                resetForm();
              }}
              sx={{
                textDecoration: "underline",
                color: palette.primary.main,
                "&:hover": {
                  cursor: "pointer",
                  color: palette.primary.light,
                },
              }}
            >
              {isLogin
                ? "Dont have an account? Sign up here."
                : "Already have an account? Login here."}
            </Typography>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default Form;
