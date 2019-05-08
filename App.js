import React, { Component } from "react";
import {
  Text,
  View,
  Button,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
  AsyncStorage,
  StatusBar,
  Dimensions
} from "react-native";
import { createAppContainer, createStackNavigator } from "react-navigation";

class Archive extends Component {
  static navigationOptions = {
    title: "スタックした記事",
    headerTintColor: "white",
    headerBackTitleStyle: {
      color: "white"
    },
    headerStyle: { backgroundColor: "#00aced" }
  };
  constructor() {
    super();
    this.state = {
      threads: []
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    AsyncStorage.getAllKeys((err, keys) => {
      if (err) {
        console.error(err);
        return false;
      } else {
        AsyncStorage.multiGet(keys, (err, data) => {
          threads = data.map(i => {
            return JSON.parse(i[1]);
          });
          this.setState({ threads });
          return true;
        });
      }
    });
  }

  render() {
    const { threads } = this.state;
    const { width } = Dimensions.get("window");
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          width: "100%"
        }}
      >
        <FlatList
          data={threads}
          keyExtractor={(item, index) => index.toString()}
          renderItem={item => {
            return (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  width: "100%",
                  borderBottomWidth: 2,
                  borderColor: "#f5f5f5"
                }}
              >
                <Image
                  style={{
                    width: 50,
                    height: 50
                  }}
                  source={{ uri: item.item.thumbnail }}
                />
                <View
                  style={{
                    width: width - 50
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column"
                    }}
                  >
                    <Text
                      style={{
                        color: "#000"
                      }}
                    >
                      {item.item.title}
                    </Text>
                    <Text
                      style={{
                        color: "#ababab",
                        fontSize: 10
                      }}
                    >
                      {item.item.domain}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>
    );
  }
}

class Spining extends Component<{}> {
  constructor() {
    super();
    this.state = {
      degree: new Animated.Value(0)
    };
  }

  componentWillMount() {
    this.animated();
  }

  componentWillMount() {
    this.animated = () => {
      return false;
    };
  }

  animated() {
    Animated.timing(this.state.degree, {
      toValue: 1,
      duration: 4000,
      easing: Easing.linear
    }).start(() => {
      this.setState({
        degree: new Animated.Value(0)
      });
      this.animated();
    });
  }

  render() {
    const { degree } = this.state;
    const _degree = degree.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"]
    });

    return (
      <View>
        <Animated.Image
          source={require("./assets/cat.png")}
          style={{ transform: [{ rotate: _degree }] }}
        />
      </View>
    );
  }
}

class Main extends Component<{}> {
  static navigationOptions = ({ navigation }) => ({
    title: "新茶記事",
    headerTintColor: "white",
    headerStyle: {
      backgroundColor: "#00aced"
    },
    headerRight: (
      <TouchableOpacity
        style={{
          paddingRight: 8
        }}
        onPress={() => {
          navigation.navigate("Archive");
        }}
      >
        <Image
          source={require("./assets/cat.png")}
          style={{
            height: 25,
            width: 25
          }}
        />
      </TouchableOpacity>
    )
  });

  constructor() {
    super();
    this.state = {
      isLoading: true,
      threds: [],
      opacity: new Animated.Value(0),
      fontSize: new Animated.Value(0)
    };
  }

  componentWillMount() {
    fetch("https://www.reddit.com/r/newsokur/hot.json")
      .then(response => response.json())
      .then(responseJson => {
        let threads = responseJson.data.children;
        threads = threads.map(i => {
          i.key = i.data.url;
          return i;
        });
        this.setState({ threads: threads, isLoading: false });
      })
      .catch(error => {
        console.error(error);
      });
  }

  animate() {
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 1000
    }).start();
    Animated.spring(this.state.fontSize, {
      toValue: 1,
      friction: 1
    }).start();
  }
  save({ data }) {
    AsyncStorage.setItem(data["title"], JSON.stringify(data), err => {
      if (err) {
        console.error(err);
        return false;
      } else {
        return true;
      }
    });
  }

  render() {
    const { threads, isLoading, opacity, fontSize } = this.state;
    const { width } = Dimensions.get("window");
    const _fontSize = fontSize.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 12]
    });

    if (!isLoading) this.animate();

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {isLoading ? (
          <Spining />
        ) : (
          <Animated.View
            style={{
              opacity: opacity
            }}
          >
            <FlatList
              data={threads}
              renderItem={({ item }) => {
                return (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      width: "100%"
                    }}
                  >
                    <Image
                      style={{
                        width: 50,
                        height: 50
                      }}
                      source={{ uri: item.data.thumbnail }}
                    />
                    <View
                      style={{
                        width: width - 50
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "column"
                        }}
                      >
                        <Animated.Text
                          style={{
                            fontSize: _fontSize
                          }}
                        >
                          {item.data.title}
                        </Animated.Text>
                        <Text
                          style={{
                            color: "#ababab",
                            fontSize: 10
                          }}
                        >
                          {item.data.domain}
                        </Text>
                        <Button
                          onPress={() => {
                            this.save(item);
                          }}
                          title={"ストック"}
                        />
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </Animated.View>
        )}
      </View>
    );
  }
}

const AppNavigation = createAppContainer(
  createStackNavigator({
    Main: { screen: Main },
    Archive: { screen: Archive }
  })
);

export default class App extends Component<{}> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <AppNavigation />
      </View>
    );
  }
}
