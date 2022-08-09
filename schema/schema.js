const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            async resolve(parentValue, args){
                const response = await axios.get(`http://localhost:3000/companies/${parentValue.id}/users`);
                return response.data;
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: { 
            type: CompanyType,
            resolve(parentValue, args){
                const response = axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(res => res.data);
                return response;
            } 
        }
    }
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: {type: GraphQLString} },
            async resolve(parentValue, args) {
                const response =  await axios.get(`http://localhost:3000/users/${args.id}`);
                return response.data;
            }
        },
        company: {
            type: CompanyType,
            args: { id: {type: GraphQLString } },
            async resolve(parentValue, args) {
                const response = await axios.get(`http://localhost:3000/companies/${args.id}`);
                return response.data;
            }
        },
        users: {
            type: new GraphQLList(UserType),
            async resolve(parentValue, args){
                const response = await axios.get(`http://localhost:3000/users`);
                return response.data;
            }
        },
        companies: {
            type: new GraphQLList(CompanyType),
            async resolve(parentValue, args){
                const response = await axios.get('http://localhost:3000/companies');
                return response.data;
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType, //Type of data that we will be returning from the resolve function
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString }
            },
            async resolve(parentValue, { firstName, age, companyId }) {
                const response = await axios.post('http://localhost:3000/users', {
                    firstName,
                    age,
                    companyId
                });
                return response.data;
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(parentValue, { id }){
                const response = await axios.delete(`http://localhost:3000/users/${id}`);
                return response.data;
            }
        },
        editUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLString },
                companyId: { type: GraphQLString }
            },
            async resolve(parentValue, { id, firstName, age, companyId }){
                const response = await axios.patch(`http://localhost:3000/users/${id}`,{
                    firstName,
                    age,
                    companyId
                });
                return response.data;
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});