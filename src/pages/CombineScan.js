import React, { Component } from 'react'
import {connect} from 'react-redux';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { Link } from 'react-router-dom'

import AnnotatedSection from '../components/AnnotatedSection'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faqrcode from '@fortawesome/fontawesome-free-solid/faQrcode'
import faWrench from '@fortawesome/fontawesome-free-solid/faWrench'
import faStar from '@fortawesome/fontawesome-free-solid/faStar'

import {
  Button,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';

class CombineScan extends Component {

  constructor(props) {
    super(props)
    this.state = {
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      address: '',
      productParts: {}
    }
    this.onChange = (address) => this.setState({ address })
  }

  handleMergeProducts = () => {
    var productPartsObject = []
    Object.keys(this.state.productParts).map(inputKey => {
      const value = this.state.productParts[inputKey].value;
      if (value.length > 0) {
        productPartsObject.push(value);
      }
      return false;
    })
    /* TODO Implement customdata merging with some choosing UI
    var customData = [];
    for (var i = 0; i < productPartsObject.length; ++i) {
      this.props.passageInstance.getProductCustomDataById(productPartsObject[i], "latest", {from: this.props.web3Accounts[0], gas:10000000})
        .then(function(result) {
          console.log(customData);
          customData.concat(result);
        });
    }
    var customDataJson = JSON.stringify(customData);*/
    this.props.passageInstance.combineProducts(productPartsObject, this.state.name, this.state.description, this.state.latitude.toString(), this.state.longitude.toString(), {from: this.props.web3Accounts[0], gas:1000000})
      .then((result) => {
        // product created! ... but we use an event watcher to show the success message, so nothing actuelly happens here after we create a product
      })
  }

  handleSelect = (address, placeId) => {
    this.setState({ address })

    geocodeByAddress(this.state.address)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        // TODO: disable the "update" button until a lat/long is returned from the Google Maps API
        this.setState({latitude: latLng.lat, longitude: latLng.lng})
      })
      .catch(error => console.error('Error', error))
  }

  appendInput() {
    var newInputKey = `input-${Object.keys(this.state.productParts).length}`; // this might not be a good idea (e.g. when removing then adding more inputs)
    this.setState({ productParts: {...this.state.productParts, [newInputKey]: {key: "", value: ""} }});
  }

  render() {
    const inputProps = {
      value: this.state.address,
      onChange: this.onChange,
      placeholder: "Emplacement (adresse, latitude & longitude, entreprise)"
    }

    return (
      <div>
        {/* Section d'ajout des identifiants */}
        <AnnotatedSection
          annotationContent={
            <div>
              <FontAwesomeIcon fixedWidth style={{paddingTop:"3px", marginRight:"6px"}} icon={faqrcode}/>
              Identifiants des produits
            </div>
          }
          panelContent={
            <div>
              <FormGroup>
                {
                  Object.keys(this.state.productParts).map(inputKey =>
                    <FormGroup style={{display:"flex"}} key={inputKey}>
                      Identifiant du produit: 
                      <Input placeholder="0x..." style={{flex: 1}} onChange={(e) => { this.setState({ productParts: {...this.state.productParts, [inputKey]: {...this.state.productParts[inputKey], key: inputKey, value: e.target.value} }})}}/>
                    </FormGroup>
                  )
                }
                <Link to="#" onClick={ () => this.appendInput() }>
                  Ajouter un produit à la combinaison
                </Link>
              </FormGroup>
            </div>
          }
        />

        {/* Section des informations du produit combiné */}       
        <AnnotatedSection
          annotationContent={
            <div>
              <FontAwesomeIcon fixedWidth style={{paddingTop:"3px", marginRight:"6px"}} icon={faStar}/>
              Informations du produit combiné
            </div>
          }
          panelContent={
            <div>
              <FormGroup>
                  <Label>Nom</Label>
                  <Input placeholder="Nom du produit" value={this.state.name} onChange={(e) => {this.setState({name: e.target.value})}}></Input>
              </FormGroup>
              <FormGroup>
                  <Label>Description</Label>
                  <Input placeholder="Description sommaire du produit" value={this.state.description} onChange={(e) => {this.setState({description: e.target.value})}}></Input>
              </FormGroup>
              <FormGroup>
                  <Label>Emplacement actuel</Label>
                  <PlacesAutocomplete
                    inputProps={inputProps}
                    onSelect={this.handleSelect}
                    classNames={{input: "form-control"}}
                  />
              </FormGroup>
              <p>*Les certifications et données additionnelles pourront être modifiées après la création.</p>
            </div>
          }
        />

        {/* Section des actions */}
        <AnnotatedSection
          annotationContent={
            <div>
              <FontAwesomeIcon fixedWidth style={{paddingTop:"3px", marginRight:"6px"}} icon={faWrench}/>
              Actions
            </div>
          }
          panelContent={
            <div>
              <Button color="primary" onClick={this.handleMergeProducts}>Effectuer la combinaison</Button>
            </div>
          }
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    passageInstance: state.reducer.passageInstance,
    web3Accounts: state.reducer.web3Accounts
  };
}

export default connect(mapStateToProps)(CombineScan);
