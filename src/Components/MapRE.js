import React, { Component, PropTypes } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableHightLight,
  TouchableOpacity,
  DrawerLayoutAndroid
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { Header, Button } from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "./FirebaseConfig";
import Geocoder from "react-native-geocoder";
import geolib from "geolib";
import MapViewDirections from 'react-native-maps-directions';

const myIcon = <Icon name="crosshairs-gps" size={30} color="#333" />;
const GOOGLE_MAPS_APIKEY = "AIzaSyDmMKv6H1UmRN-1D8HUFj-C_WrdAlkwwB8";
class MapRE extends Component {
  constructor(props) {
    super(props);
    database = firebase.database();
    Geocoder.fallbackToGoogle("AIzaSyASXNMgcK0TPsu8RIA5ceulYo_bMJIH6iU");
    this.openDrawer = this.openDrawer.bind(this);
    arrayMarker = [];

    this.state = {
      region: {
        latitude: 10.8702117,
        longitude: 106.8037364,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0221
      },
      gps: {
        latitude: 20,
        longitude: 20
      },
      address: {
        city: "city",
        district: "district"
      },
      markers: arrayMarker,
      shouldRenderListMarker: false,
      getATM: false,
      getGPS: true
    };
  }

  componentWillMount() {
    console.log("Will Mount");
  }

  componentDidMount() {
    console.log("Did mount");
  }

  componentWillReceiveProps(nextProps) {
    console.log("WILL RECEIVE : NextProp");
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log(
      "SHOULD UPDATE: Render List Markers " + nextState.shouldRenderListMarker
    );
    console.log("SHOULD UPDATE: Get Gps " + nextState.getGPS);
    if (
      nextState.getGPS === true ||
      nextState.shouldRenderListMarker === true ||
      nextState.getATM === true
    ) {
      return true;
    }
    return false;
  }

  componentWillUpdate(nextProps, nextState) {
    console.log(
      "WILL UPDATE: Render List Markers " + nextState.shouldRenderListMarker
    );
    console.log("WILL UPDATE: Get Gps " + nextState.getGPS);
    console.log("WILL UPDATE: Get ATM " + nextState.getATM);
    console.log("WILL UPDATE: City " + nextState.address.city);
    console.log("WILL UPDATE: District " + nextState.address.district);

    // Get Array Markers from FireBase
    if (nextState.shouldRenderListMarker === true) {
      database
        .ref("VietTinBank")
        .child(String(nextState.address.city))
        .child(String(nextState.address.district))
        .on("value", snap => {
          snap.forEach(data => {
            arrayMarker.push({
              key: data.key,
              data: data.val()
            });
          });

          nextState.markers = arrayMarker;
        });
    }

    // Get GPS
    if (nextState.getGPS === true) {
      navigator.geolocation.getCurrentPosition(
        position => {
          (nextState.region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }),
            (nextState.gps = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }),
            Geocoder.geocodePosition({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }).then(res => {
              //res[1].locality //Ho Chi Minh City
              //  res[1].feature,// Trường tho
              //  res[2].feature,
              //  res[3].feature, //Phước long
              //  res[4].feature ,//Thủ đức,
              //  res[5].feature ,//Ho Chi Minh City
              nextState.address = {
                city: res[5].feature,
                district: formatVietnamese(res[4].feature)
              };
            });
        },
        error => {
          console.log(error);
        },
        { enableHighAcuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    }

    // Get Marker Close to Current Pos
    if (nextState.getATM === true) {
    }
  }

  componentDidUpdate(prevProps, prevState) {
    prevState.shouldRenderListMarker = false;
    prevState.getGPS = false;
    (prevState.getATM = false),
      console.log(
        "DID UPDATE: Render List Markers " + prevState.shouldRenderListMarker
      );
    console.log("DID UPDATE: Get Gps " + prevState.getGPS);
    console.log("DID UPDATE: Get ATM " + prevState.getATM);
    console.log("DID UPDATE: City " + prevState.address.city);
    console.log("DID UPDATE: Address " + prevState.address.district);
  }

  componentWillUnmount() {
    console.log("Will Unmount");
  }

  renderListMarker() {
    console.log("RENDER: " + this.state.shouldRenderListMarker);
    markers = [];
    if (this.state.shouldRenderListMarker === true) {
      console.log("RENDER Marker");
      for (marker of this.state.markers) {
        markers.push(
          <Marker
            key={marker.data.address}
            title={marker.key}
            coordinate={{
              latitude: parseFloat(marker.data.lat),
              longitude: parseFloat(marker.data.long)
            }}
          />
        );
      }
      return markers;
    }
    console.log("Empty Array Marker");
    return markers;
  }

  renderMarker() {
    if (this.state.getATM === true) {
      var marker = this.getMarkerCloseToCurrentPos(this.state);
      return (
        <View>
          <Marker
            key={marker.address}
            title={marker.key}
            coordinate={{
              latitude: parseFloat(marker.latitude),
              longitude: parseFloat(marker.longitude)
            }}
          />
          <MapViewDirections
            origin={{
              latitude: parseFloat(marker.latitude),
              longitude: parseFloat(marker.longitude)
            }}
            destination={{
              latitude: parseFloat(this.state.gps.latitude),
              longitude: parseFloat(this.state.gps.longitude)
            }}
            apikey={GOOGLE_MAPS_APIKEY}
          />
        </View>
      );
    }
    console.log("No Marker");
  }

  showAddress() {
    this.setState({
      shouldRenderListMarker: true,
      getGPS: false,
      getATM: false
    });
  }

  getGPS() {
    this.setState({
      shouldRenderListMarker: false,
      getGPS: true,
      getATM: false
    });
  }

  getATM() {
    this.setState({
      shouldRenderListMarker: false,
      getGPS: false,
      getATM: true
    });
  }

  openDrawer() {
    this.refs["DRAWER_REF"].openDrawer();
  }

  getMarkerCloseToCurrentPos(dataState) {
    var data = {
      key: "",
      address: "",
      amount: "",
      workingHour: "",
      latitude: 20,
      longitude: 20
    };
    // Get fist Marker in state
    for (marker of dataState.markers) {
      data = {
        key: marker.key,
        address: marker.data.Address,
        amount: marker.data.Amount,
        workingHour: marker.data.WorkingHour,
        latitude: marker.data.lat,
        longitude: marker.data.long
      };
      break;
    }
    console.log("DATA");
    console.log(data);
    var minDistance = geolib.getDistance(
      {
        latitude: data.latitude,
        longitude: data.longitude
      },
      {
        latitude: dataState.gps.latitude,
        longitude: dataState.gps.longitude
      }
    );

    var temp = {
      key: "",
      address: "",
      amount: "",
      workingHour: "",
      latitude: 20,
      longitude: 20
    };
    for (marker of dataState.markers) {
      temp = {
        key: marker.key,
        address: marker.data.Address,
        amount: marker.data.Amount,
        workingHour: marker.data.WorkingHour,
        latitude: marker.data.lat,
        longitude: marker.data.long
      };
      // Check minDistance
      if (
        minDistance >
        geolib.getDistance(
          {
            latitude: temp.latitude,
            longitude: temp.longitude
          },
          {
            latitude: dataState.gps.latitude,
            longitude: dataState.gps.longitude
          }
        )
      ) {
        data = {
          key: temp.key,
          address: temp.address,
          amount: temp.amount,
          workingHour: temp.workingHour,
          latitude: temp.latitude,
          longitude: temp.longitude
        };
        minDistance = geolib.getDistance(
          {
            latitude: temp.latitude,
            longitude: temp.longitude
          },
          {
            latitude: dataState.gps.latitude,
            longitude: dataState.gps.longitude
          }
        );
      }
    }
    console.log("DATA MIN");
    console.log(data);
    return data;
  }

  render() {
    var navigationView = (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <Text style={{ margin: 10, fontSize: 15, textAlign: "left" }}>
          I'm in the Drawer!
        </Text>
      </View>
    );
    return (
      <DrawerLayoutAndroid
        drawerWidth={240}
        ref={"DRAWER_REF"}
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        renderNavigationView={() => navigationView}
      >
        <View style={styles.container}>
          <View style={styles.container01}>
            <MapView
              provider="google"
              style={styles.map}
              showsUserLocation={true}
              region={this.state.region}
            >
              {this.renderListMarker()}
              {this.renderMarker()}
            </MapView>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.mapButton}
              onPress={this.getGPS.bind(this)}
            >
              {myIcon}
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              // loadingProps={{ size: "large", color: "rgba(111, 202, 186, 1)" }}
              icon={{ name: "search", type: "font-awesome" }}
              title="FIND"
              buttonStyle={{
                backgroundColor: "#333",
                borderColor: "transparent",
                borderWidth: 0,
                borderRadius: 10
              }}
              onPress={this.showAddress.bind(this)}
            />
            <Button
              // loadingProps={{ size: "large", color: "rgba(111, 202, 186, 1)" }}
              icon={{ name: "search", type: "font-awesome" }}
              title="SHOW"
              buttonStyle={{
                backgroundColor: "#333",
                borderColor: "transparent",
                borderWidth: 0,
                borderRadius: 10
              }}
              onPress={this.getATM.bind(this)}
            />
          </View>
        </View>

        <Header
          placement="left"
          leftComponent={{
            icon: "menu",
            color: "#fff",
            onPress: () => this.openDrawer()
          }}
          centerComponent={{ text: "호앙 난", style: { color: "#fff" } }}
          backgroundColor={"#333333"}
        />
      </DrawerLayoutAndroid>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  container01: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "flex-end"
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",

    alignItems: "center",
    marginVertical: 30,
    backgroundColor: "transparent"
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center"
  },
  mapButton: {
    width: 75,
    height: 75,
    borderRadius: 85 / 2,
    backgroundColor: "rgba(252, 253, 253, 0.9)",
    justifyContent: "center",
    marginBottom: 20,
    marginRight: 20,
    alignItems: "center",
    shadowColor: "black",
    shadowRadius: 8,
    shadowOpacity: 0.12,
    opacity: 0.6,
    zIndex: 10
  }
});

function formatVietnamese(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

export default MapRE;
