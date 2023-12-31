import { React, Component } from "react"
// import Clarifai from "clarifai"
import ParticlesBg from "particles-bg"
import "./App.css"
import Navigation from "./components/Navigation/Navigation"
import Logo from "./components/Logo/Logo"
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm"
import Rank from "./components/Rank/Rank"
import FaceRecognition from "./components/FaceRecognition/FaceRecognition"
import Signin from "./components/Signin/Signin"
import Register from "./components/Register/Register"

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: "signin",
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  },
}

class App extends Component {
  constructor() {
    super()
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    })
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box
    // console.log(clarifaiFace)
    const image = document.getElementById("inputimage")
    const width = Number(image.width)
    const height = Number(image.height)
    // console.log(width, height)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    }
  }

  displayFaceBox = (box) => {
    // console.log(box)
    this.setState({ box: box })
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value })
  }

  // onRouteChange = (route) => {
  //   if (route === "signout") {
  //     this.setState({ isSignedIn: false })
  //   } else if (route === "home") {
  //     this.setState({ isSignedIn: true })
  //   }
  //   this.setState({ route: route })
  // }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input })

    const IMAGE_URL = this.state.input

    const raw = JSON.stringify({
      user_app_id: {
        user_id: "clarifai",
        app_id: "main",
      },
      inputs: [
        {
          data: {
            image: {
              url: IMAGE_URL,
            },
          },
        },
      ],
    })

    const requestOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        // Authorization: "Key " + "e5f94e62f50c4753b80eacd193649bdf",
        Authorization: `Key e5f94e62f50c4753b80eacd193649bdf`,
      },
      body: raw,
    }

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    fetch(
      `https://api.clarifai.com/v2/models/face-detection/versions/6dc7e46bc9124c5c8824be4822abe105/outputs`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        // console.log(result.outputs[0].data.regions[0].region_info.bounding_box)
        // this.setState((prevState) => ({
        //   user: {
        //     ...prevState.user,
        //     entries: prevState.user.entries + 1,
        //   },
        // }))
        const boxDimention = this.calculateFaceLocation(result)
        this.displayFaceBox(boxDimention)
        if (result) {
          fetch("http://localhost:3000/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: this.state.user.id,
            }),
          })
            .then((response) => response.json())
            .then((count) => {
              this.setState(Object.assign(this.state.user, { entries: count }))
            })
            .catch(console.log)
        }
      })
      .catch((error) => console.log("error", error))
  }

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState(initialState)
    } else if (route === "home") {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route: route })
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state
    return (
      <div className="App">
        <ParticlesBg className="particles" type="circle" bg={true} />
        {/* <Particles className="particles" params={particlesOptions} /> */}
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {route === "home" ? (
          <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : route === "signin" ? (
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    )
  }
}

export default App
