const ProviderService = require('../services/provider-service');

const ProviderController = {
    getProviders: async (req,res) => {
        try {
            const providers = await ProviderService.getProviders()
            res.status(200).json(providers);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error, couldn't get Providers")
        }
    },
    getProviderById: async (req, res) => {
      try {
        const provider = await ProviderService.getProviderById(req.params.id);
        res.status(200).json(provider);
      } catch (error) {
        console.error(error.message);
        res.status(404).send("Provider not found")
      }
    },

    createProvider: async(req,res) => {
        try {
            const newProvider = await ProviderService.createProvider(req.body);
            res.status(201).json(newProvider)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error, couldn't create Provider")
        }
    },

    updateProvider: async(req,res) => {
        try {
            const updatedProvider = await ProviderService.updateProvider(req.params.id, req.body);
            res.status(200).json(updatedProvider);
        } catch (error) {
            console.error(error.message);
            res.status(404).send({ error: "Couldn't update, Provider not found" })
        }
    },

    deleteProvider: async(req, res) => {
        try {
            await ProviderService.deleteProvider(req.params.id);
            res.status(200).json({message: "Provider deleted successfully"});
        } catch (error) {
            console.error(error.message);
            res.status(404).send({ error: "Couldn't delete, Provider not found" })
        }
    }
  };

module.exports = ProviderController;